/* eslint-disable */
import type {PropsWithChildren} from 'react';
import React, {useEffect} from 'react';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import {Linking, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {downloadZip, unZipFile} from './files_utils';

import {groth16_prover_zkey_file} from 'react-native-rapidsnark';

const fs = RNFetchBlob.fs;

type SectionProps = PropsWithChildren<{
    title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';
    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    },
                ]}>
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    },
                ]}>
                {children}
            </Text>
        </View>
    );
}

function App(): React.JSX.Element {
    const [saving, setSaving] = React.useState(false);

    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        Linking.getInitialURL().then(initialUrl => {
            if (!initialUrl) {
                console.log('no initial url provided');
                return;
            }

            console.log('initialUrl', initialUrl);
            try {
                const parsedUrl = new URL(initialUrl);
                const circuitUrl = parsedUrl.searchParams.get('circuit_url');
                const callbackUrl = parsedUrl.searchParams.get('callback_url');

                const pluginName = circuitUrl!.match(/[^/]+(?=\.zip)/igm)[0]!;

                const targetPath = RNFS.DocumentDirectoryPath + '/unpacked/' + pluginName;

                console.log('circuitUrl', circuitUrl);
                console.log('callbackUrl', callbackUrl);

                downloadZip(circuitUrl, async (zipPath: string) => {
                    setSaving(true);

                    console.log('downloaded zip', zipPath);

                    // Drop existing folder with contents
                    if (await fs.exists(targetPath)) {
                        console.log('dropping existing folder:' + targetPath);
                        await fs.unlink(targetPath);
                    }
                    await fs.mkdir(targetPath);

                    console.log('zipPath', zipPath);
                    // Unzip library only support zip folder, not file entries
                    return unZipFile(zipPath, targetPath);
                }).then(async (files) => {
                    const listOfFiles = files.reduce((acc: string, item: string) => {
                        return acc.concat(`${item}\n`);
                    }, '');

                    console.log("Files loaded:\n", listOfFiles);

                    const zkeyPath = targetPath + '/circuit_final.zkey';
                    const witness = await RNFS.readFile(targetPath + '/witness.wtns', 'base64');

                    try {
                        console.log('calling groth16_prover_zkey_file');
                        const proof = await groth16_prover_zkey_file(zkeyPath, witness);
                        console.log('groth16_prover_zkey_file called:', proof);
                    } catch (e) {
                        console.error('error calling groth16_prover_zkey_file', e);
                    }
                }, (e) => {
                    console.error('error downloading zip', e);
                });
            } catch (e) {
                console.error('error parsing initial url', e);
            }
        });
    }, []);

    return (
        <SafeAreaView style={{backgroundColor: Colors.lighter}}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={Colors.lighter}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={{backgroundColor: Colors.lighter}}>
                <Header/>
                <View
                    style={{
                        backgroundColor: isDarkMode ? Colors.black : Colors.white,
                    }}>
                    <Section title="Step One">
                        Edit <Text style={styles.highlight}>App.tsx</Text> to change this
                        screen and then come back to see your edits.
                    </Section>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default App;
