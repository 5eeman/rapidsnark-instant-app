import RNFS from 'react-native-fs';
import {unzip, zip} from "react-native-zip-archive";
import RNFetchBlob from 'rn-fetch-blob';

let dirs = RNFetchBlob.fs.dirs;

export async function downloadZip(url, responseTransformer) {
    console.log('URL TO DOWNLOAD', url);
    return await RNFetchBlob
        .config({
            fileCache: true,
            appendExt: 'zip',
            path: dirs.DocumentDir + "/zips",
        })
        .fetch('GET', url, {
            //some headers ..
        })
        .then(async (res) => {
            // console.log('The file saved to ', res.path())
            // console.log('result ', res.info().status)
            const statusCode = res.info().status;
            if (statusCode === 200) {
                const downloadPath = res.path();

                const result = await responseTransformer(downloadPath);

                res.flush(); // remove downloaded file from the cache
                // console.log(`${RNFetchBlob.fs.dirs.DocumentDir}/unzip`);
                return result;
            }
        }).catch(err => {
            console.log('ERROR', err);
        });
}

export async function unZipFile(zipPath, targetPath) {
    console.log('unzip', zipPath, targetPath);
    console.log("zipPath exists:" + await RNFS.exists(zipPath));
    console.log("targetPath exists:" + await RNFS.exists(targetPath));

    await unzip(zipPath, targetPath).then(_ => console.log('unzipped')).catch(e => console.log(`failed unzip ${e}`));

    return await readFiles(targetPath);
}

async function readFiles(targetPath) {
    try {
        let result = await RNFS.readDir(targetPath);
        let fileDescriptors = [];

        for (const i in result) {
            fileDescriptors.push({
                name: result[i].name,
                path: result[i].path
            });
        }

        console.log('fileDescriptors', fileDescriptors);
        if (fileDescriptors.length) {
            return fileDescriptors.map((fileInfo) => {
                return fileInfo.name;
            });
        }
        console.log('no files');
        return [];
    } catch (err) {
        console.log(err.message, err.code);
    }
}
