import fs from 'fs';
import path from 'path';

export default class ExcelGenerator {

    /**
     * Genera archivo XML que Excel puede abrir como .xlsx
     * @param {Object} bookData - Datos del libro de IVA
     * @param {Object} companyData - Datos de la empresa
     * @returns {Object} Información del archivo generado
     */
    static async generateVATBookExcel(bookData, companyData) {
        try {
            // Crear directorio temporal si no existe
            const tempDir = path.resolve('./temp/excel');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Nombre del archivo Excel
            const sanitizedName = companyData.name.replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `${bookData.year}_${companyData.nif}_${bookData.bookCode}_${sanitizedName}.xls`;
            const filePath = path.join(tempDir, fileName);


            // Generar contenido XML para Excel
            const xmlContent = this.generateExcelXML(bookData, companyData);

            // Escribir archivo
            fs.writeFileSync(filePath, xmlContent, 'utf8');

            return {
                filePath,
                fileName,
                success: true
            };
        } catch (error) {
            throw new Error(`Error generando Excel: ${error.message}`);
        }
    }
    /**
     * Genera el contenido XML que Excel puede interpretar
     */
    static generateExcelXML(bookData, companyData) {
        const sheetName = bookData.bookType === 'IVA_SOPORTADO' ? 'FACTURAS_RECIBIDAS' : 'FACTURAS_EMITIDAS';
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Libro de IVA</Title>
  <Author>Sistema de Gestión</Author>
  <Created>${new Date().toISOString()}</Created>
</DocumentProperties>

<Styles>
  <Style ss:ID="HeaderStyle">
    <Font ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#366092" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  
  <Style ss:ID="TitleStyle">
    <Font ss:Bold="1" ss:Size="14" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#366092" ss:Pattern="Solid"/>
    <Alignment ss:Horizontal="Center"/>
  </Style>
  
  <Style ss:ID="CurrencyStyle">
    <NumberFormat ss:Format="&quot;€&quot;#,##0.00"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  
  <Style ss:ID="PercentStyle">
    <NumberFormat ss:Format="0.00&quot;%&quot;"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  
  <Style ss:ID="DataStyle">
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
    </Borders>
  </Style>
  
  <Style ss:ID="TotalStyle">
    <Font ss:Bold="1"/>
    <Interior ss:Color="#FFFFCC" ss:Pattern="Solid"/>
    <NumberFormat ss:Format="&quot;€&quot;#,##0.00"/>
    <Borders>
      <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2"/>
      <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
      <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2"/>
    </Borders>
  </Style>
</Styles>

<Worksheet ss:Name="${sheetName}">
<Table>`;

        // Configurar columnas
        const columns = this.getColumnWidths(bookData.bookType);
        columns.forEach(width => {
            xml += `<Column ss:Width="${width}"/>`;
        });

        // Título del documento
        xml += `
  <Row ss:Height="25">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="TitleStyle">
      <Data ss:Type="String">LIBRO DE IVA - ${bookData.bookType === 'IVA_SOPORTADO' ? 'FACTURAS RECIBIDAS' : 'FACTURAS EMITIDAS'}</Data>
    </Cell>
  </Row>`;

        // Información de la empresa
        xml += `
  <Row>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">Empresa: ${this.escapeXML(companyData.name)}</Data></Cell>
  </Row>
  <Row>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">NIF: ${companyData.nif}</Data></Cell>
  </Row>
  <Row>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">Período: ${bookData.period}</Data></Cell>
  </Row>
  <Row>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">Fecha Generación: ${new Date().toLocaleDateString('es-ES')}</Data></Cell>
  </Row>
  <Row></Row>`;

        // Cabeceras
        const headers = this.getHeaders(bookData.bookType);
        xml += `  <Row>`;
        headers.forEach(header => {
            xml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${header}</Data></Cell>`;
        });
        xml += `  </Row>`;

        // Datos
        if (bookData.entries && bookData.entries.length > 0) {
            bookData.entries.forEach((entry, index) => {
                xml += this.generateDataRow(entry, index + 1, bookData.bookType);
            });
        } else {
            xml += `
  <Row>
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="DataStyle">
      <Data ss:Type="String">NO HAY DATOS DISPONIBLES PARA EL PERÍODO SELECCIONADO</Data>
    </Cell>
  </Row>`;
        }

        // Fila de totales
        if (bookData.totals && bookData.entries?.length > 0) {
            xml += `
  <Row></Row>
  <Row>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="String">TOTALES:</Data></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${bookData.totals.totalBaseImponible || 0}</Data></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${bookData.totals.totalCuotaIVA || bookData.totals.cuotaIVADeducible || 0}</Data></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="DataStyle"></Cell>
    <Cell ss:StyleID="TotalStyle"><Data ss:Type="Number">${bookData.totals.totalImporte || 0}</Data></Cell>`;

            // Agregar celdas extra según el tipo
            if (bookData.bookType === 'IVA_SOPORTADO') {
                xml += `<Cell ss:StyleID="DataStyle"></Cell><Cell ss:StyleID="DataStyle"></Cell>`;
            } else {
                xml += `<Cell ss:StyleID="DataStyle"></Cell><Cell ss:StyleID="DataStyle"></Cell>`;
            }

            xml += `  </Row>`;
        }

        xml += `
</Table>
</Worksheet>

<Worksheet ss:Name="RESUMEN">
<Table>
<Column ss:Width="150"/>
<Column ss:Width="150"/>
<Column ss:Width="120"/>
<Column ss:Width="100"/>

  <Row ss:Height="25">
    <Cell ss:MergeAcross="3" ss:StyleID="TitleStyle">
      <Data ss:Type="String">LIBRO REGISTRO DE IVA - RESUMEN</Data>
    </Cell>
  </Row>
  <Row></Row>
  
  <Row><Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">DATOS DE LA EMPRESA</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Razón Social:</Data></Cell><Cell><Data ss:Type="String">${this.escapeXML(companyData.name)}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">NIF:</Data></Cell><Cell><Data ss:Type="String">${companyData.nif}</Data></Cell></Row>
  <Row></Row>
  
  <Row><Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">DATOS DEL LIBRO</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Tipo de Libro:</Data></Cell><Cell><Data ss:Type="String">${bookData.bookType}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Período:</Data></Cell><Cell><Data ss:Type="String">${bookData.period}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Fecha Generación:</Data></Cell><Cell><Data ss:Type="String">${new Date().toLocaleDateString('es-ES')}</Data></Cell></Row>
  <Row></Row>
  
  <Row><Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">TOTALES GENERALES</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Total Entradas:</Data></Cell><Cell><Data ss:Type="Number">${bookData.entryCount || 0}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Base Imponible Total:</Data></Cell><Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${bookData.totals?.totalBaseImponible || 0}</Data></Cell></Row>
  <Row><Cell><Data ss:Type="String">Cuota IVA Total:</Data></Cell><Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${bookData.totals?.totalCuotaIVA || bookData.totals?.cuotaIVADeducible || 0}</Data></Cell></Row>`;

        // Desglose de IVA si existe
        if (bookData.totals?.desgloseIVA?.length > 0) {
            xml += `
  <Row></Row>
  <Row><Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">DESGLOSE POR TIPO DE IVA</Data></Cell></Row>
  <Row>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Tipo IVA</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Base Imponible</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Cuota IVA</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Nº Facturas</Data></Cell>
  </Row>`;

            bookData.totals.desgloseIVA.forEach(item => {
                xml += `
  <Row>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${item.tipoIVA}%</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${item.baseImponible}</Data></Cell>
    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${item.cuotaIVA}</Data></Cell>
    <Cell ss:StyleID="DataStyle"><Data ss:Type="Number">${item.numeroFacturas}</Data></Cell>
  </Row>`;
            });
        }

        xml += `
</Table>
</Worksheet>

</Workbook>`;

        return xml;
    }

    /**
     * Genera una fila de datos
     */
    static generateDataRow(entry, rowNumber, bookType) {
        let xml = `  <Row>`;

        // Datos comunes
        xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="Number">${rowNumber}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${this.formatDate(entry.fechaFactura)}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${this.escapeXML(entry.numeroFactura || '')}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${entry.nifProveedor || entry.nifCliente || ''}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${this.escapeXML(entry.nombreProveedor || entry.nombreCliente || '')}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${entry.baseImponible || 0}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(entry.tipoIVA || 0) / 100}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${entry.cuotaIVA || 0}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${(entry.tipoIRPF || 0) / 100}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${entry.cuotaIRPF || 0}</Data></Cell>`;
        xml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${entry.importeTotal || 0}</Data></Cell>`;

        // Datos específicos según tipo
        if (bookType === 'IVA_SOPORTADO') {
            xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${entry.deducible !== false ? 'SÍ' : 'NO'}</Data></Cell>`;
            xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${this.escapeXML(entry.concepto || '')}</Data></Cell>`;
        } else {
            xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${entry.estadoCobro || ''}</Data></Cell>`;
            xml += `    <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${this.escapeXML(entry.concepto || '')}</Data></Cell>`;
        }

        xml += `  </Row>`;
        return xml;
    }

    /**
     * Obtiene las cabeceras según el tipo de libro
     */
    static getHeaders(bookType) {
        const commonHeaders = [
            'Nº REGISTRO',
            'FECHA FACTURA',
            'NÚMERO FACTURA',
            'NIF/CIF',
            'NOMBRE/RAZÓN SOCIAL',
            'BASE IMPONIBLE',
            'TIPO IVA (%)',
            'CUOTA IVA',
            'TIPO IRPF (%)',
            'CUOTA IRPF',
            'IMPORTE TOTAL'
        ];

        if (bookType === 'IVA_SOPORTADO') {
            return [...commonHeaders, 'DEDUCIBLE', 'CONCEPTO'];
        } else {
            return [...commonHeaders, 'ESTADO COBRO', 'CONCEPTO'];
        }
    }

    /**
     * Obtiene los anchos de columna
     */
    static getColumnWidths(bookType) {
        const commonWidths = [80, 100, 120, 100, 200, 100, 80, 100, 80, 100, 100];

        if (bookType === 'IVA_SOPORTADO') {
            return [...commonWidths, 80, 200];
        } else {
            return [...commonWidths, 100, 200];
        }
    }

    // Utilidades
    static escapeXML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    static formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-ES');
        } catch (error) {
            return dateString;
        }
    }
}