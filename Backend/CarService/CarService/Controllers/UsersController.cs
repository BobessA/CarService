﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;
using System.Text;
using CarService.Attributes;
using static CarService.Helpers.AuthHelper;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace CarService.Controllers
{
    [Route("api/Users")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class UsersController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public UsersController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Userek lekérése
        /// </summary>
        /// <param name="userId">user.id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>UserDTO list, 400, 204</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<UserDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> GetUsers(string? userId, CancellationToken cToken)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                if (Guid.TryParse(userId, out Guid parsedUserId))
                {
                    query = query.Where(u => u.Id == parsedUserId);
                }
                else
                {
                    return BadRequest(new GenericResponseDTO("Users", "GET", "Invalid userId format", null));
                }
            }

            var users = await query
                .Select(u => new UserDTO
                {
                    userId = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    roleId = u.RoleId,
                    discount = u.Discount,
                })
                .ToListAsync(cToken);

            if (users == null || users.Count == 0)
            {
                return NoContent();
            }

            return Ok(users);
        }

        /// <summary>
        /// User adatok módosítása
        /// </summary>
        /// <param name="request">UpdateUserRequest</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 404, 400</returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> PutUser([FromBody] UpdateUserRequest request, CancellationToken cToken)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.userId, cToken);
            
            if (user == null)
            {
                return NotFound();
            }

            user.Name = request.name;
            user.Phone = request.phone;
            user.RoleId = request.roleId ?? user.RoleId;
            user.Discount = request.discount ?? 0;

            try
            {
                await _context.SaveChangesAsync(cToken);
                return Ok();
            } 
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Users", "PUT", ex.Message, null));
            }

        }

        /// <summary>
        /// User adatok rögzítése regisztráció nélkül
        /// </summary>
        /// <param name="request">PostUserRequest</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 404, 400</returns>
        [HttpPost]
        [ProducesResponseType(typeof(UserDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> PostUser([FromBody] PostUserRequest request, CancellationToken cToken)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.email, cToken))
            {
                return BadRequest(new GenericResponseDTO("Users", "POST", "Already registered user", null));
            }

            try
            {
                var user = new User
                {
                    Name = request.name,
                    Discount = request.discount,
                    RoleId = request.roleId ?? 3,
                    Phone = request.phone,
                    Email = request.email,
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync(cToken);

                var newUser = await _context.Users
                .Select(u => new UserDTO
                {
                    userId = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    roleId = u.RoleId,
                    discount = u.Discount,
                })
                .FirstOrDefaultAsync(cToken);

                return Ok(newUser);

            } catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Users", "POST", ex.Message, null));
            }
        }

        /// <summary>
        /// Regisztráció
        /// </summary>
        /// <param name="request">RegistrationRequest</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 400</returns>
        [HttpPost("Registration")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Registration([FromBody] RegistrationRequest request, CancellationToken cToken)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.email && u.PasswordHash != null, cToken))
            {
                return BadRequest(new GenericResponseDTO("Users/Registration", "POST", "Already registered user", null));
            } 
            else if (await _context.Users.AnyAsync(u => u.Email == request.email, cToken))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.email, cToken);
                user.PasswordHash = AuthHelper.HashPassword(request.password);
                user.Name = request.name;

                await _context.SaveChangesAsync(cToken);

                return Ok();
            } else
            {
                var user = new User
                {
                    Name = request.name,
                    PasswordHash = AuthHelper.HashPassword(request.password),
                    RoleId = request.roleId ?? 3,
                    Phone = request.phone,
                    Email = request.email,
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync(cToken);

                return Ok();
            }

        }

        /// <summary>
        /// Bejelentkezés
        /// </summary>
        /// <param name="authorizationHeader">Basic auth header</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>LoginResponse, 401</returns>
        [HttpGet("Login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromHeader(Name = "Authorization")] string authorizationHeader, CancellationToken cToken)
        {
            //Problem with the authorization header
            if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase)) 
            {
                return BadRequest(new GenericResponseDTO(
                    "Users/Login",
                    "GET",
                    "Authorization header is missing or not in Basic format",
                    null));
            }

            var auth = authorizationHeader.Substring("Basic ".Length).Trim();

            string email;
            string password;
            try
            {
                string userPassword = (Encoding.UTF8.GetString(Convert.FromBase64String(auth)));
                if (userPassword.Split(':',2).Length != 2)
                {
                    return BadRequest(new GenericResponseDTO(
                        "Users/Login",
                        "GET",
                        "Username or password missing",
                        null));
                }

                email = userPassword.Split(':', 2)[0];
                password = userPassword.Split(':', 2)[1];

                Console.WriteLine(email, password);

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cToken);

                if (user == null || user.PasswordHash == null) 
                {
                    return BadRequest(new GenericResponseDTO(
                        "Users/Login",
                        "GET",
                        "User does not exist in the db",
                        null));
                } 
                else if (!AuthHelper.VerifyPassword(password, user.PasswordHash))
                {
                    return BadRequest(new GenericResponseDTO(
                        "Users/Login",
                        "GET",
                        "Password is incorrect",
                        null));
                }
                else 
                {
                    LoginResponse userGuid = new LoginResponse
                    {
                        userId = user.Id,
                        roleId = user.RoleId,
                        name = user.Name,
                        email = user.Email,
                        phone = user.Phone,
                        discount = user.Discount,
                    };
                    return Ok(userGuid);
                }
            }
            catch
            {
                Console.WriteLine("catch... 1");

                return Unauthorized();
            }
        }



        /// <summary>
        /// Userek keresése név vagy email alapján
        /// </summary>
        /// <param name="query">Keresett szöveg (név vagy email)</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>UserDTO list, 400, 204</returns>
        [HttpGet("Search")]
        [ProducesResponseType(typeof(List<UserDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> SearchUsers([FromQuery] string query, CancellationToken cToken)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new GenericResponseDTO("Users/Search", "GET", "Query parameter is required", null));
            }

            var users = await _context.Users
                .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
                .Select(u => new UserDTO
                {
                    userId = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    roleId = u.RoleId,
                    discount = u.Discount,
                })
                .ToListAsync(cToken);

            if (users == null || users.Count == 0)
            {
                return NoContent();
            }

            return Ok(users);
        }
    }
}
