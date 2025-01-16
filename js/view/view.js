import { HEADER_OF_PARAMETERS } from "../const.js";
import { writeFile } from 'fs/promises';
import * as XLSX from 'xlsx'; // Импортируем библиотеку xlsx

export class View {
    constructor(datas) {
        this.datas = datas;
    }

    async getLog() {
        const data = this.datas;
        console.log(data);
    }

    async getTxtFile() {
        const headers = HEADER_OF_PARAMETERS;
        const data = this.datas;

        // Создаем строку заголовков
        const headerLine = headers.join('\t'); // Заголовки разделены табуляцией

        // Создаем строки данных
        const dataLines = [];
        const maxRows = Math.max(...data.map(arr => arr.length)); // Определяем максимальное количество строк

        for (let i = 0; i < maxRows; i++) {
            const row = data.map(arr => (arr[i] !== undefined ? arr[i].toFixed(5) : '0.00000')); // Форматируем числа
            dataLines.push(row.join('\t')); // Объединяем значения строки через табуляцию
        }

        // Объединяем заголовки и данные
        const fileContent = [headerLine, ...dataLines].join('\n'); // Заголовки + строки данных

        // Записываем в файл
        try {
            await writeFile('output.txt', fileContent); // Записываем файл
            console.log('Файл успешно создан: output.txt');
        } catch (err) {
            console.error('Ошибка при записи файла:', err);
        }
    }

    async getXlsxFile() {
        const data = this.datas;

        // Создаем массив для Excel
        const excelData = [];

        // Добавляем заголовки
        excelData.push(HEADER_OF_PARAMETERS);

        // Определяем максимальное количество строк в данных
        const maxRows = Math.max(...data.map(arr => arr.length));

        // Формируем строки данных
        for (let i = 0; i < maxRows; i++) {
            const row = data.map(arr => (arr[i] !== undefined ? arr[i] : ''));
            excelData.push(row);
        }

        // Создаем рабочую книгу (workbook) и рабочий лист (worksheet)
        const worksheet = XLSX.utils.aoa_to_sheet(excelData); // Преобразуем массив в лист
        const workbook = XLSX.utils.book_new(); // Создаем новую книгу
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // Добавляем лист в книгу

        // Генерируем Excel-файл в формате .xlsx
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Записываем файл на диск
        try {
            await writeFile('output.xlsx', excelBuffer); // Записываем файл
            console.log('Файл успешно создан: output.xlsx');
        } catch (err) {
            console.error('Ошибка при записи файла:', err);
        }
    }

    async getCsvFile() {
        const data = this.datas;

        // Функция для создания CSV
        function createCSV(headers, data) {
            let csvContent = headers.join(',') + '\n'; // Добавляем заголовки

            // Определяем максимальное количество строк в данных
            const maxRows = Math.max(...data.map(arr => arr.length)); // Исправлено Math.max

            // Формируем строки данных
            for (let i = 0; i < maxRows; i++) {
                const row = data.map(arr => (arr[i] !== undefined ? arr[i] : '')).join(',');
                csvContent += row + '\n';
            }

            return csvContent;
        }
        // Генерируем CSV
        const csvData = createCSV(HEADER_OF_PARAMETERS, data);

        // Асинхронная запись в файл
        try {
            await writeFile('output.csv', csvData); // Используем writeFile из fs/promises
            console.log('Файл успешно создан: output.csv');
        } catch (err) {
            console.error('Ошибка при записи файла:', err);
        }
    }

    async getFileTech() {

        const XLSX = this.datas
        const fileName = 'artemartem.txt'
        // Определяем заголовки
        const headers = [
            "t", "xg", "yg", "zg", "Vxg", "Vyg", "Vzg", "wx", "wy", "wz",
            "pitch", "yaw", "roll", "alpha", "betta", "delta_p", "delta_y", "delta_r"
        ];
    
        // Создаем содержимое файла
        let fileContent = '';
    
        // Добавляем заголовки
        fileContent += headers.join('\t') + '\n';
    
        // Формируем строки данных
        for (let i = 0; i < XLSX[0].length; i++) {
            const row = [
                XLSX[0][i].toFixed(2),  // t
                XLSX[1][i].toFixed(2),  // xg
                XLSX[2][i].toFixed(2),  // yg
                XLSX[3][i].toFixed(2),  // zg
                XLSX[9][i].toFixed(2),  // Vxg
                XLSX[10][i].toFixed(2), // Vyg
                XLSX[11][i].toFixed(2), // Vzg
                XLSX[15][i].toFixed(6), // wx
                XLSX[16][i].toFixed(6), // wy
                XLSX[17][i].toFixed(6), // wz
                XLSX[4][i].toFixed(4),  // pitch
                XLSX[5][i].toFixed(4),  // yaw
                XLSX[6][i].toFixed(4),  // roll
                XLSX[7][i].toFixed(6),  // alpha
                XLSX[8][i].toFixed(6),  // betta
                XLSX[12][i].toFixed(4), // delta_p
                XLSX[13][i].toFixed(4), // delta_y
                XLSX[14][i].toFixed(4)  // delta_r
            ];
            fileContent += row.join('\t') + '\n';
        }
    
        // Записываем содержимое в файл
        try {
            await writeFile(fileName, fileContent);
            console.log(`Файл успешно создан: ${fileName}`);
        } catch (err) {
            console.error('Ошибка при записи файла:', err);
        }
    }

}