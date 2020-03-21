import * as vscode from 'vscode';
// import * as os from 'os';
// import { dirname } from 'path';
const loadJsonFile = require('load-json-file');
const jsonfile = require('jsonfile');
var range: vscode.Selection; // rango seleccionado en el editor de texto
var text: string; // texto seleccionado en el editor de texto
let lastEntry: string = '';
var config = (vscode.workspace.getConfiguration('filterText') as any); // aqui cargaremos la configuracion de nuestra extension
const pathFile = config.filePath.windows; // ruta de nuestro archivo de literales
const generalFile = config.filePathGeneral.windows; // ruta de nuestro archivo de literales general
const keyPattern = config.stringTemplate.windows; // plantilla de nuestra clave

export function activate(context: vscode.ExtensionContext) {    
    let inplace = vscode.commands.registerCommand('extension.filterTextInplace', (args?: {}) => filterText(args));
    
    context.subscriptions.push(inplace);
}

async function filterTextWrapper(args?: {}) {
    if (typeof args === 'undefined') {
        vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: 'Please enter a valid literal key',
            value: lastEntry,
            validateInput: validateKey
        }).then(async (entry: string) => {
            // comprobamos que el usuario no haya pulsado ESC
            if(entry){
                lastEntry = entry;
                searchKey(entry);
            }
        });
    } else {
        vscode.window.showErrorMessage('Invalid arguments passed. Must be a hash map with key \"cmd\" of type string.');
    }
}

/**
 * Función que se ejecuta al usar el atajo de teclado. 
 */
async function filterText(args?: {}) {
    // guardamos el directorio actual de trabajo
    // const cwd: string = getCurrentWorkingDirectory();

    // guardamos el rango seleccionado en el editor
    range = getSelectionRange();
    if(range) {
        // guardamos el texto seleccionado en el editor
        text = getTextFromRange(range);
        replaceString(text);
    }
    
       
     
}

/**
 * Función que sustituye la cadena seleccionada por la clave de su literal
 * con el formato adecuado
 * 
 * @param text Texto seleccionado en el editor
 */
async function replaceString(text: string) {
    const fileObject = await loadJsonFile(pathFile);
    const generalObject = await loadJsonFile(generalFile);
    searchLiteral(text, fileObject, generalObject);
}

/**
 * Función que busca un texto dentro de un objeto de literales
 * 
 * @param text Texto seleccionado en el editor
 * @param fileObject Objecto con las claves y los valores del archivo de literales
 * @param generalObject Objeto con las claves y los valores del archivo general de literales
 */
function searchLiteral(text: string, fileObject, generalObject) {
    let keyExists = false;
    let keyInGeneral = false;
    let cleanText = text.replace(/\s\s+/g, ' '); // eliminamos espacios extra, tabulaciones y saltos de linea
    // iteramos sobre los literales del archivo general
    for (let key in generalObject) {
        // comparamos el texto seleccionado con los valores literales
        if (cleanText === generalObject[key]) {
            keyInGeneral = true;
            // creamos la cadena con la que sustituimos el texto seleccionado
            let newText = eval('`' + keyPattern + '`');
            setTextToSelectionRange(range, newText);
        }
    }
    // si no existe en el archivo general buscamos en el propio del proyecto
    if(!keyInGeneral){
        // iteramos sobre los literales
        for (let key in fileObject) {
            // comparamos el texto seleccionado con los valores literales
            if (cleanText === fileObject[key]) {
                keyExists = true;
                // creamos la cadena con la que sustituimos el texto seleccionado
                let newText = eval('`' + keyPattern + '`');
                setTextToSelectionRange(range, newText);
            }
        }

        if (!keyExists) {
            filterTextWrapper();
        }
    }
    

    
}
/**
 * Función que sustituye la cadena seleccionada por la clave de su literal
 * con el formato adecuado
 * 
 * @param text Texto seleccionado en el editor
 */
async function searchKey(text: string) {
    const fileObject = await loadJsonFile(pathFile);
    createKey(text, fileObject);
}

/**
 * Función que busca una clave dentro de un objeto de literales
 * 
 * @param key Clave introducida en el input
 * @param fileObject Objecto con las claves y los valores del archivo de literales
 */
function createKey(key: string, fileObject) {
    // iteramos sobre las claves de los literales
    let keyExists = false;
    for (let keyFile in fileObject) {
        // comparamos la clave introducida con las claves de los literales
        if (key === keyFile) {
            keyExists = true;
        }
    }
   
    // comprobamos si existe la clave
    if(keyExists) {
        // si la clave existe volvemos a mostrar el input
        filterTextWrapper();
    }
    else {
        fileObject[key] = text.replace(/\s\s+/g, ' '); // aqui eliminamos el formato del texto
        // añadimos nuestra nueva clave y literal al archivo de literales
        jsonfile.writeFileSync(pathFile, fileObject, { spaces: 2, EOL: '\r\n' });
        let newText = eval('`' + keyPattern + '`');
        // colocamos la nueva clave en el código html
        setTextToSelectionRange(range, newText);
        lastEntry = ''; // reinicializamos el value del input
    }
}

/**
 * Funcion que comprueba que la clave sea valida
 * 
 * @param input Value introduced by the user
 */
function validateKey(input: string) :string {    
    return (input !== '') ? '' : 'Esta clave no es válida';
}
function getSelectionRange(): vscode.Selection {
    let editor = vscode.window.activeTextEditor;

    return (!editor.selection.isEmpty) ? editor.selection : undefined;
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
 * This implementation of the QuickPickItem contains the information necessary
 * for displaying a quickpick item, as well as the command it should execute.
 */
// class Item implements vscode.QuickPickItem {
//     label: string;
//     description: string;

//     /**
//      * The literal command which the user wants to execute when this item is
//      * picked from the QuickPick list.
//      */
//     command: string;

//     constructor(label: string, description: string, command: string) {
//         this.label = label;
//         this.description = description;
//         this.command = command;
//     }

//     /**
//      * Runs the command.
//      */
//     run() {
//         let cmd = {
//             cmd: this.command
//         };
//         filterTextWrapper(cmd);
//     }
// };