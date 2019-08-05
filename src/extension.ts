import * as vscode from 'vscode';
// import * as os from 'os';
// import { dirname } from 'path';
const loadJsonFile = require('load-json-file');
var range: vscode.Selection; // rango seleccionado en el editor de texto
var text: string; // texto seleccionado en el editor de texto
var config = (vscode.workspace.getConfiguration('filterText') as any); // aqui cargaremos la configuracion de nuestra extension
const pathFile = config.filePath.windows; // ruta de nuestro archivo de literales

export function activate(context: vscode.ExtensionContext) {    
    let inplace = vscode.commands.registerCommand('extension.filterTextInplace', (args?: {}) => filterText(args));
    
    context.subscriptions.push(inplace);
}

/**
 * Función que se ejecuta al usar el atajo de teclado. 
 */
async function filterText(args: {}) {

    // guardamos el directorio actual de trabajo
    // const cwd: string = getCurrentWorkingDirectory();

    // guardamos el rango seleccionado en el editor
    range = getSelectionRange();

    // guardamos el texto seleccionado en el editor
    text = getTextFromRange(range);    
    
    replaceString(pathFile, text);   
    
}

function getSelectionRange(): vscode.Selection {
    let config = (vscode.workspace.getConfiguration('filterText') as any);
    let useDocument = config.useDocumentIfEmptySelection;

    let editor = vscode.window.activeTextEditor;

    let range = undefined;
    if (!editor.selection.isEmpty) {
        range = editor.selection;
    }

    if (range === undefined) {
        if (useDocument === false) {
            let position = editor.selection.anchor;
            range = new vscode.Range(position.line, position.character, position.line, position.character);
        } else if (editor.document.lineCount > 0) {
            let lineCount = editor.document.lineCount;
            range = new vscode.Range(0, 0, lineCount, editor.document.lineAt(lineCount - 1).text.length);
        }
    }

    return range;
}

function getTextFromRange(range: vscode.Selection): string {
    if (range !== undefined) {
        let editor = vscode.window.activeTextEditor;
        return editor.document.getText(range);
    }
    return '';
}

function setTextToSelectionRange(range: vscode.Selection, text: string): void {
    let target = Promise.resolve(vscode.window.activeTextEditor);
    target.then((editor) => {
        editor.edit((editBuilder) => {
            
                editBuilder.replace(range, text);
            
        });
        editor.revealRange(range);
    }, (reason: Error) => {
        vscode.window.showErrorMessage(reason.message);
    });
}

/**
 * Función que devuelve la ruta al directorio actual de trabajo
 * 
 * @returns string Directorio actual de trabajo
 */
// function getCurrentWorkingDirectory(): string {
//     const uri = vscode.window.activeTextEditor.document.uri;

//     const isFileOrUntitledDocument = uri && (uri.scheme === 'file' || uri.scheme === 'untitled');
//     if (isFileOrUntitledDocument) {
//         const useDocumentDirAsWorkDir = vscode.workspace.getConfiguration('filterText').useDocumentDirAsWorkDir;

//         if (useDocumentDirAsWorkDir && uri.scheme === 'file') {
//             return dirname(uri.fsPath);
//         }

//         const folder = vscode.workspace.getWorkspaceFolder(uri);
//         if (folder) {
//             return folder.uri.fsPath;
//         }

//         const folders = vscode.workspace.workspaceFolders;
//         if (folders != undefined && folders.length > 0) {
//             return folders[0].uri.fsPath;
//         }
//         // Github #9: if no workspace folders, and uri.scheme !== 'untitled' (i.e. existing file), use folder of that file. Otherwise, use user home directory.
//         if (uri.scheme !== 'untitled') {
//             return dirname(uri.fsPath);
//         }
//     }

//     return os.homedir();
// }

/**
 * Función que sustituye la cadena seleccionada por la clave de su literal
 * con el formato adecuado
 * 
 * @param path Ruta donde se encuentra el archivo de literales
 * @param text Texto seleccionado en el editor
 */
async function replaceString(path: string, text: string) {
    const fileObject = await loadJsonFile(path);
    searchKey(text, fileObject);
    //console.log('fileObject',fileObject);
}

/**
 * Función que busca un texto dentro de un objeto de literales
 * 
 * @param text Texto seleccionado en el editor
 * @param fileObject Objecto con las claves y los valores del archivo de literales
 */
function searchKey(text: string, fileObject) {
    // iteramos sobre los literales
    for (let key in fileObject) {
        // comparamos el texto seleccionado con los valores literales
        if (text === fileObject[key]) {
            // creamos la cadena con la que sustituimos el texto seleccionado
            let newText = '{{' + key + '|translate}}';
            setTextToSelectionRange(range, newText);
        }
    }
}