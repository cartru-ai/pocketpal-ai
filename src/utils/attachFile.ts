import {Alert} from 'react-native';
import {
  pick,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';

const MAX_CHARS = 6000;
const UNSUPPORTED = ['xlsx', 'xls', 'pdf', 'docx', 'doc', 'pptx'];

/**
 * Deja elegir un archivo de texto (txt, csv, tsv, json, md...) y devuelve
 * su contenido ya formateado para pegarlo en el mensaje.
 */
export async function pickAndReadTextFile(): Promise<string | null> {
  try {
    const [file] = await pick({mode: 'import', allowMultiSelection: false});
    if (!file) {
      return null;
    }
    const name = file.name ?? 'archivo';
    const ext = name.includes('.')
      ? (name.split('.').pop() ?? '').toLowerCase()
      : '';

    if (UNSUPPORTED.includes(ext)) {
      Alert.alert(
        'Formato aún no compatible',
        'Por ahora la app lee texto, CSV, TSV, JSON y Markdown. Si es un Excel, ábrelo y guárdalo como CSV; luego adjúntalo.',
      );
      return null;
    }

    const path = file.uri.startsWith('file://')
      ? decodeURIComponent(file.uri.replace('file://', ''))
      : file.uri;

    let text = await RNFS.readFile(path, 'utf8');
    let note = '';
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
      note = '\n[Archivo recortado: se muestran solo los primeros caracteres]';
    }
    return `Archivo: ${name}\n\`\`\`\n${text}\n\`\`\`${note}`;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    Alert.alert('No se pudo leer el archivo', String(error));
    return null;
  }
}
