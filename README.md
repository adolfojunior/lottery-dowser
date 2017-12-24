# Dowser

Let the Dowser compute the luck for you!

### Usage

First, install all the dependencies.

```bash
npm install
```

Now, compute statistics and generate data

```bash
npm start -- [megasena|lotofacil|lotomania]
```
OR
```bash
npm start -- --help
```
Which some custom options:
```bash
# generate lotofacil games with 7 numbers
npm start -- megasena -g --limit 10 --size 7
# lotomania you can select 50 numbers to match 20
npm start -- lotomania -g --limit 10 --size 50
# lotofacil you can select 50 numbers to match 20
npm start -- lotofacil -g --limit 10
```

### Updating data

First add the last HTML collected at the CAIXA site ( [megasena](http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/), [lotofacil](http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/),[lotomania](http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/) ) to the [/script](/script) folder.

The command migth parse the HTML and update the JS file at [/src/data](/src/data) folder.

```bash
npm run update [megasena|lotofacil|lotomania]
```
