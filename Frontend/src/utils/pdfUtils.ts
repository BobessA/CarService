import { OrderPdfData } from "../models/OrderPdfData";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import logoBase64 from "../assets/logoBase64";

(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

export const generateOrderPdf = (order: OrderPdfData) => {

  const docDefinition = {
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
          { text: 'Megrendelés', style: 'header', },
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
                  { text: `${order.orderDate}`, style: 'data', alignment: 'right', width: 100, },
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
            
            { text: 'Ügyintéző', style: 'label', },
            { text: `${order.administrator.name} \n ${order.administrator.email} \n ${order.administrator.phoneNumber}`, style: 'data', },
            
            { text: 'Szerelő', style: 'label', },
            { text: `${order.mechanicer.name}`, style: 'data', },
          ],
          [
            //megrendelo adatok
            { text: 'Megrendelő', style: 'subheader' },
            { text: `${order.customer.name}`, style: 'data', },

            { text: 'Elérhetőség', style: 'label', },
            { text: `${order.customer.email} \n ${order.customer.phoneNumber}`, style: 'data', },
            
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
        ],
      },
      '\n\n',
      { text: 'Kapcsolódó ajánlat', style: 'label', },
      { text: `${order.relatedOffer.offerNumber}`, style: 'data', },
      
      { text: 'Szervíz felkeresésének oka', style: 'label', },
      { text: `${order.relatedOffer.comment}`, style: 'data', },
      '\n',

      { text: 'Tételek', style: 'subheader', },
      {
        table: {
          widths: ["auto", "auto", "auto", "auto","*"],
          body: [
            ["Cikkszám", "Mennyiség", "Nettó egységár Ft", "Összesen (bruttó) Ft", "Megjegyzés"],
            ...order.items.map((item) => [
              item.productId,
              item.quantity,
              `${item.unitPrice.toLocaleString()}`,
              `${item.grossAmount.toLocaleString()}`,
              `${item.comment.toLocaleString()}`
            ]),
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },


      { text: 'A megrendeléssel kapcsolatos megjegyzések', style: 'label', },
      { text: `${order.comment}`, style: 'data', },
    ],
    styles: {
      header: { color: '#333333', width: '*', fontSize: 28, bold: true, alignment: 'right', margin: [0, 0, 0, 15], },
      subheader: { color: '#aaaaab', bold: true, margin: [0, 0, 0, 10],fontSize: 14, },
      label: { color: '#aaaaab', bold: true, margin: [0, 7, 0, 3], fontSize: 12, },
      labelRight: { color: '#aaaaab', bold: true, width: '*', fontSize: 12, alignment: 'right',},
      labelSmall: { color: '#aaaaab', bold: true, width: '*', fontSize: 10, },
      data: { color: '#333333', bold: true, fontSize: 12, },
    },
  };

  pdfMake.createPdf(docDefinition).open();
};
