import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import User  from "../models/User";
import { OrderPdfData } from "../models/OrderPdfData";
import { ProductData } from "../models/ProductData";
import logoBase64 from "../assets/logoBase64";

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

export function generateOrderPdf(order : OrderPdfData, customer : User, administrator : User, mechanicer : User, usedProducts : ProductData[]) 
: TDocumentDefinitions {
  return {
      pageSize: "A4",
      pageMargins: [20, 40, 20, 40],
      content: [
        {
          columns: [
          {
            image: logoBase64,
            width: 150,
          },
          [
            { text: 'Megrendelés', style: 'header'},
            {
              stack: [
                {
                  columns: [
                    { text: 'Rendelésszám', style: 'labelRight', },
                    { text: `${order.orderNumber}`, style: 'data', alignment: 'right', width: 100, },
                  ],
                },
                {
                  columns: [
                    { text: 'Rendelés dátuma', style: 'labelRight', },
                    { text: `${dateFormat(order.orderDate)}`, style: 'data', alignment: 'right', width: 100, },
                  ],
                },
                {
                  columns: [
                    { text: 'Státusz', style: 'labelRight', },
                    { text: `${order.statusName}`, style: 'data', alignment: 'right', width: 100, color: 'green', },
                  ],
                },
              ],
            },
          ],
        ],
        },
        '\n',
        {
          columns: [
            [
              //saját adatok
              { text: 'Munkát végezte', style: 'subheader' },
              { text: 'CarService Kft.', style: 'data', },

              { text: 'Elérhetőség', style: 'label', },
              { text: '6000 Kecskemét \n Izsáki út 10. \n GAMF udvar', style: 'data', },
            
              administrator.name && [
                { text: 'Ügyintéző', style: 'label', },
                { text: `${administrator.name ?? ""} \n ${administrator.email} \n ${administrator.phone}`, style: 'data', },
              ],
              
              mechanicer.name && [
                { text: 'Szerelő', style: 'label', },
                { text: `${mechanicer.name}`, style: 'data', },
              ]
            ],
            [
              //megrendelo adatok
              { text: 'Megrendelő', style: 'subheader' },
              { text: `${customer.name}`, style: 'data', },

              { text: 'Elérhetőség', style: 'label', },
              { text: `${customer.email} \n ${customer.phone}`, style: 'data', },

              { text: 'Kapcsolódó ajánlat', style: 'label', },
              { text: `${order.offerNumber}`, style: 'data', },
              
              { text: 'Szervíz felkeresésének oka', style: 'label', },
              { text: `${order.offerIssueDescription}`, style: 'tableData', },
            ],
          ],
        },
        '\n',
        {
          columns: [
            [
            { text: 'Jármű adatai', style: 'label', },
              {
                columns: 
                  [
                    { text: 'Rendszám', style: 'labelSmall', },
                    { text: `${order.vehicle.licensePlate}`, style: 'data', },
                  ],
              },
              {
                columns: 
                  [
                    { text: 'Típus', style: 'labelSmall', },
                    { text: `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.yearOfManufacture})`, style: 'data', },
                  ],
              },
              {
                columns: 
                  [
                    { text: 'Óra állás', style: 'labelSmall', },
                    { text: `${order.vehicle.odometer.toLocaleString()} km`, style: 'data', },
                  ],
              },
            ],
            [],
          ],
        },
        '\n',
        { text: 'A megrendeléssel kapcsolatos megjegyzések', style: 'label', },
        { text: `${order.comment ?? "-"}`, style: 'tableData', },
        '\n',
        { text: 'Tételek', style: 'subheader', },
        {
          table: {
            widths: ["auto", "auto","auto", "auto", "auto","*"],
            body: [
              [
                { text: "Cikkszám", style: 'labelSmall' },
                { text: "Megnevezés", style: 'labelSmall' },
                { text: "Mennyiség", style: 'labelSmall' },
                { text: "Nettó egységár Ft", style: 'labelSmall' },
                { text: "Összesen (bruttó) Ft", style: 'labelSmall' },
                { text: "Megjegyzés", style: 'labelSmall' },
              ],
              ...order.items.map((item) => [
                { text: item.productId, style: 'tableData' },
                { text: usedProducts.find(p => p.productId === item.productId)?.name ?? "", style: 'tableData' },
                { text: item.quantity, style: 'tableData' },
                { text: item.unitPrice.toLocaleString(), style: 'tableData' },
                { text: item.grossAmount.toLocaleString(), style: 'tableData' },
                { text: item.comment, style: 'tableData' },
              ]),
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 10],
        },
        {
          stack: [
            {
              columns: [
                { text: 'Összesített nettó érték', style: 'labelRight', },
                { text: `${order.netAmount.toLocaleString()} Ft`, style: 'data', alignment: 'right', width: 100, },
              ],
            },
            {
              columns: [
                { text: 'Kedvemény százalék', style: 'labelRight', },
                { text: `${customer.discount ?? 0} %`, style: 'data', alignment: 'right', width: 100, },
              ],
            },
            {
              columns: [
                { text: 'Fizetendő összeg', style: 'labelRight', },
                { text: `${order.grossAmount.toLocaleString()} Ft`, style: 'data', alignment: 'right', width: 100, },
              ],
            },
          ],
        },
        '\n\n\n\n\n',
        {
          columns: [
            [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 150,
                    y2: 0,
                    lineWidth: 1,
                    lineColor: '#000000'
                  }
                ],
                margin: [0, 5, 0, 5],
                alignment: 'center',
              },
              { text: 'Ügyintéző', style: 'data', alignment: 'center', },
            ],
            [
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: 150,
                    y2: 0,
                    lineWidth: 1,
                    lineColor: '#000000'
                  }
                ],
                margin: [0, 5, 0, 5],
                alignment: 'center',
              },
              { text: 'Ügyfél', style: 'data', alignment: 'center', },
            ],
          ],
        },
      ],
      styles: {
        header: { color: '#333333', fontSize: 28, bold: true, alignment: 'right', margin: [0, 0, 0, 15], },
        subheader: { color: '#aaaaab', bold: true, margin: [0, 0, 0, 10],fontSize: 14, },
        label: { color: '#aaaaab', bold: true, margin: [0, 7, 0, 3], fontSize: 12, },
        labelRight: { color: '#aaaaab', bold: true, fontSize: 12, alignment: 'right',},
        labelSmall: { color: '#aaaaab', bold: true, fontSize: 10, },
        data: { color: '#333333', bold: true, fontSize: 12, },
        tableData: { color: '#333333', bold: true, fontSize: 10, },
      },
    };
};

const dateFormat = (date: string) : string => {
  try {
    const dateObject: Date = new Date(date);

    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return date;
  }
}
