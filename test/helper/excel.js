const Excel = require('exceljs');

const _sheetNames = (workbook)=>{
    let sheetNames = []
    workbook.eachSheet(function(worksheet, sheetId) {
        sheetNames.push(worksheet.name)
    });
    return sheetNames
}

const _fileName = (pathFile,affix)=>{
    affix = (affix) ? `_${affix}` : "";
    let pathVar = pathFile
    pathVar = pathVar.split("/")
    let fileName = pathVar[0].split(".")
    let ext = fileName.pop()
        fileName = fileName.join(".")
    pathVar = [`${fileName}${affix}`,ext].join(".")
    return pathVar
}

const _buildColumnHeader = (header)=>{
    let varHeader = header
    varHeader = varHeader.map(row=>{
        let typeOfRow = typeof row
        if(typeOfRow=="string"){
            return {id:row,header:row}
        }
        if(typeOfRow=="object"){
            let keys = Object.keys(row)
            keys = keys.filter(rkey=>["id","header"].includes(rkey))
            if(keys.length==2){
                return row
            }
        }
    }).filter(row=>row)
    return varHeader
}

const _buildDataRow = (dataRow)=>{
    let varRow = dataRow
    if(typeof dataRow=="object"){
        let keys = Object.keys(dataRow)
        varRow = keys.map(rowKey=>{
            return dataRow[rowKey]
        })
    }
    return varRow
}

exports.createFile = ({
    title,
    worksheet:dataWorksheet,
    header,
    content,
    file_path
}) => new Promise((resolve, reject) => {
    // - Create a Workbook
    let workbook = new Excel.Workbook();

    // - Set Workbook Properties
    workbook.title = title
    workbook.creator = 'testeroke'
    workbook.lastModifiedBy = 'testeroke'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = true

    for(let i in dataWorksheet) {
        // - add a worksheet
        let worksheet = workbook.addWorksheet(dataWorksheet[i])

        // - Add column headers
        worksheet.columns = header[i]

        // - Add a row by contiguous Array
        for(let j in content[i]) {
            worksheet.addRow(content[i][j])
        }
    }

    workbook.xlsx.writeFile(file_path)
        .then(function () {
            resolve(true)
        }).catch(reject)
})

exports.readFileOnSheet = ({
    path_file:pathFile,
    sheet_name:selectedName,
})=> new Promise((resolve,reject)=>{

    let workbook = new Excel.Workbook();

    workbook.xlsx.readFile(pathFile)
    .then(function() {
        let sheetNames = _sheetNames(workbook)
        selectedName = selectedName || sheetNames[0]

        let worksheet = workbook.getWorksheet(selectedName);
        let rowsData = []
        worksheet.eachRow(function(row,rowNumber){
            rowsData.push(row.values)
        })
        resolve(rowsData)
    }).catch(reject)
})

exports.addWorksheetData = ({
    path_file:pathFile,
    sheet_name:selectedName,
    rows:dataRows
}) => new Promise((resolve,reject)=>{

    let affix = new Date().getTime()
    let fileName = _fileName(pathFile,affix)
    let t = this
    let workbook = new Excel.Workbook();
    workbook.xlsx.readFile(pathFile)
    .then(function() {
        let sheetNames = _sheetNames(workbook)
        selectedName = selectedName || sheetNames[0]

        let worksheet = workbook.getWorksheet(selectedName);
        if(dataRows.length){
            for(let i in dataRows){
                let currentRow = _buildDataRow(dataRows[i])
                worksheet.addRow(currentRow).commit()
            }
        }

        workbook.xlsx.writeFile(fileName);
        resolve(fileName)
    }).catch(reject)
})

exports.createEmptyFileSingleWorkSheet = ({
    title,
    worksheet:dataWorksheet,
    header,
    content,
    path_file:pathFile
}) => new Promise((resolve,reject)=>{
    // - Create a Workbook
    let workbook = new Excel.Workbook();

    // - Set Workbook Properties
    workbook.title = title
    workbook.creator = 'testeroke'
    workbook.lastModifiedBy = 'testeroke'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = true

    let worksheet = workbook.addWorksheet(dataWorksheet)
    // - Add column headers
    let headerColumns = _buildColumnHeader(header)
    worksheet.columns = headerColumns

    // - Add a row by contiguous Array
    for(let j in content) {
        let rowArray = _buildDataRow(content[j])
        worksheet.addRow(rowArray)
    }

    workbook.xlsx.writeFile(pathFile)
    .then(function () {
        resolve(pathFile)
    }).catch(reject)
})