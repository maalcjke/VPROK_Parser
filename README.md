# Parser for www.vprok.ru

Этот проект реализует два скрипта для парсинга информации с сайта [www.vprok.ru](https://www.vprok.ru). Основная цель проекта — продемонстрировать навыки работы с библиотеками для браузерного парсинга и API-запросов в Node.js.

## Парсинг продукта по ссылке

```bash
node product.js <URL страницы товара> <Регион>
```
Пример использования:
```bash
node product.js "https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202" "Санкт-Петербург и область"
```

## Парсинг продуктов категории по ссылке

```bash
node category.js <URL страницы категории>
//example: node category.js "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"
```
Пример использования:
```bash
node category.js "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"
```
