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

### Updating data

First add the last HTML collected at the CAIXA site ( [megasena](loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/), [lotofacil](loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/),[lotomania](loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/) ) to the (script)[script] folder.

The command migth parse the HTML and update the JS file at (src/data)[src/data] folder.

```bash
npm run update [megasena|lotofacil|lotomania]
```
