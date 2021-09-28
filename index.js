const express = require("express");
const { google } = require("googleapis"); 

const app = express(); // criando a instancia da aplicação 

app.get("/", async (req, res) => { 
const auth = new google.auth.GoogleAuth({
    keyFile: "credenciais.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"

});


// Creat client instance for auth

const client = await auth.getClient();

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client});

const spreadsheetId = "19KIV5J5gM1-TgZQCH3vhtq0bZfJX2t2uOR2KnCg2yDQ";  

// Get metadata about spreadsheet
const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,

});

// Read rows from spreadsheet
const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "engenharia_de_software",
});

// console.log(getRows.data)

// Write row(s) to spreadsheet
// const writeRows = await googleSheets.spreadsheets.values.append({
//     auth,
//     spreadsheetId,
//     range: "engenharia_de_software!G4",
//     valueInputOption: "USER_ENTERED",
//     resource: {
//         values: [
//             []
//         ]
// }
// });

async function write(input) {
    try {
    await googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: input.planilha,
        valueInputOption: "USER_ENTERED",
        resource: {
        values: [[input.status, input.media]],
        },
    });
    } catch (error) {
    console.error("The API returned an error: " + err);
    return res
        .status(500)
        .json({ message: "Google API returned an error.", error });
    }
}

// Calculating the total number of classes for the semester according to spreadsheet

const object = getRows.data.values[1].toString();
const totalOfClass = object.split(" ");
console.log("Total de aulas do semestre: " + totalOfClass[5]);

for (let index = 3; index < 27; index++) {
    const temp = index + 1;
    const prova1 = getRows.data.values[index][3];
    const prova2 = getRows.data.values[index][4];
    const prova3 = getRows.data.values[index][5];

    //Using "ParseInt" to convert String to number // And how to calculating media and media final
    const m =
    (parseInt(prova1, 10) + parseInt(prova2, 10) + parseInt(prova3, 10)) / 3;
    const mF = 100 - parseInt(m, 10);

     //  console.log("n: "  + index  + "-" + m);

    // Application with challenge parameters

    if (getRows.data.values[index][2] > (25 * totalOfClass[5]) / 100) {
    console.log("Calculando a situação do aluno por falta");
    await write({
        planilha: "engenharia_de_software!G" + temp + ":H" + temp,
        status: "Reprovado por Falta",
        media: "0",
    });
    } else if (m < 50) {
    console.log("Calculando a situação do aluno por nota");
    await write({
        planilha: "engenharia_de_software!G" + temp + ":H" + temp,
        status: "Reprovado por Nota",
        media: "0",
    });
    } else if (m >= 50 && m < 70) {
    console.log("Calculando a média final do aluno");
    await write({
        planilha: "engenharia_de_software!G" + temp + ":H" + temp,
        status: "Exame Final",
        media: mF,
    });
    } else if (m >= 70) {
    await write({
        planilha: "engenharia_de_software!G" + temp + ":H" + temp,
        status: "Aprovado",
        media: "0",
    });
    } else {
    console.log("Algum valor inserido na planilha de maneira incorreta");
    await write({
        planilha: "engenharia_de_software!G" + temp + ":H" + temp,
        status: "ERROR",
        media: "0",
    });
    }
}

return res.status(200).json({ message: "Tabela preenchida com sucesso." });
});
     // console.log(getRows.data.values[index]);
    app.listen(3000, (req, res) => console.log("running on 3000"));

