const fs = require('fs');

// Функция, которую будем интегрировать
// Например, dy/dx = f(x, y) = x + y
function f(x, y) {
  return x + y;
}

// Метод Эйлера
function eulerMethod(x0, y0, xEnd, step) {
  let x = x0;
  let y = y0;
  const results = [];

  while (x <= xEnd) {
    results.push({ x, y }); // Сохраняем текущие значения x и y
    y = y + step * f(x, y); // Метод Эйлера: y_(n+1) = y_n + h * f(x_n, y_n)
    x = x + step; // Увеличиваем x на шаг
  }

  return results;
}

// Начальные условия
const x0 = 0; // Начальное значение x
const y0 = 1; // Начальное значение y
const xEnd = 2; // Конечное значение x
const step = 0.1; // Шаг интегрирования

// Выполняем расчет методом Эйлера
const results = eulerMethod(x0, y0, xEnd, step);

// Преобразуем результаты в текст для записи в файл
const output = results
  .map(({ x, y }) => `x: ${x.toFixed(2)}, y: ${y.toFixed(4)}`)
  .join('\n');

// Записываем результаты в файл
fs.writeFile('euler_results.txt', output, (err) => {
  if (err) {
    console.error('Ошибка при записи файла:', err);
  } else {
    console.log('Результаты успешно сохранены в файл euler_results.txt');
  }
});