import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
export default function ConfiguracoesScreen() {
    const usuario = auth.currentUser;
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [ehAdmin, setEhAdmin] = useState(false);

    async function verificarAdmin() {
        try {
            const usuarioAtual = auth.currentUser;

            if (!usuarioAtual) {
                setEhAdmin(false);
                return;
            }

            const documento = await getDoc(
                doc(db, 'usuarios', usuarioAtual.uid)
            );

            setEhAdmin(
                documento.exists() &&
                documento.data().admin === true
            );
        } catch (erro) {
            console.log(
                'Erro ao verificar admin:',
                erro
            );

            setEhAdmin(false);
        }
    }

    async function carregarFotoPerfil() {
    const usuarioAtual = auth.currentUser;

    if (!usuarioAtual) {
        setFotoPerfil(null);
        return;
    }

    try {
        const documento = await getDoc(
            doc(db, 'usuarios', usuarioAtual.uid)
        );

        const fotoUrl = documento.exists()
            ? documento.data().fotoPerfilUrl
            : null;

        if (typeof fotoUrl === 'string' && fotoUrl.trim()) {
            setFotoPerfil(fotoUrl);
            return;
        }

        // Mantém a foto antiga do emulador até ela ser enviada.
        const fotoSalva =
            `${FileSystem.documentDirectory}perfil/${usuarioAtual.uid}.jpg`;

        const infoFoto = await FileSystem.getInfoAsync(fotoSalva);

        setFotoPerfil(
            infoFoto.exists ? fotoSalva : null
        );
    } catch (erro) {
        console.log('Erro ao carregar foto de perfil:', erro);
    }
}
    useFocusEffect(
        useCallback(() => {
            verificarAdmin();
            carregarFotoPerfil();
        }, [])
    );
    async function escolherFotoPerfil() {
    const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
        Alert.alert(
            'Permissão necessária',
            'Permita o acesso às fotos para escolher uma imagem de perfil.'
        );
        return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (resultado.canceled) return;

    try {
        const usuarioAtual = auth.currentUser;

        if (!usuarioAtual) {
            Alert.alert('Erro', 'Faça login para alterar sua foto.');
            return;
        }

        const uri = resultado.assets[0].uri;

        const token = await usuarioAtual.getIdToken();

        const enderecoServidor =
            Platform.OS === 'android'
                ? 'http://10.0.2.2:3001'
                : 'http://localhost:3001';

        const resposta = await FileSystem.uploadAsync(
            `${enderecoServidor}/fotos/responsavel`,
            uri,
            {
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'foto',
                mimeType: 'image/jpeg',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (resposta.status < 200 || resposta.status >= 300) {
            throw new Error(
                `Falha no envio da foto: ${resposta.status}`
            );
        }

        const dados = JSON.parse(resposta.body);

        if (!dados.fotoUrl) {
            throw new Error('Servidor não retornou a foto.');
        }

        await setDoc(
            doc(db, 'usuarios', usuarioAtual.uid),
            { fotoPerfilUrl: dados.fotoUrl },
            { merge: true }
        );

        setFotoPerfil(dados.fotoUrl);

        Alert.alert(
            'Foto atualizada!',
            'Sua foto foi salva e poderá aparecer em outros dispositivos.'
        );
    } catch (erro) {
        console.log('Erro ao enviar foto do responsável:', erro);

        Alert.alert(
            'Erro',
            'Não foi possível enviar a foto. A foto anterior foi preservada.'
        );
    }
}
    async function excluirFotoPerfil() {
        const usuarioAtual = auth.currentUser;

        if (!usuarioAtual || !fotoPerfil) {
            return;
        }

        Alert.alert(
            'Excluir foto',
            'Deseja remover sua foto de perfil?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const fotoSalva =
                                `${FileSystem.documentDirectory}perfil/${usuarioAtual.uid}.jpg`;

                            const infoFoto =
                                await FileSystem.getInfoAsync(fotoSalva);

                            if (infoFoto.exists) {
                                await FileSystem.deleteAsync(fotoSalva, {
                                    idempotent: true,
                                });
                            }

                            setFotoPerfil(null);
                        } catch (erro) {
                            console.log(
                                'Erro ao excluir foto:',
                                erro
                            );

                            Alert.alert(
                                'Erro',
                                'Não foi possível excluir sua foto.'
                            );
                        }
                    },
                },
            ]
        );
    }
    async function sairDaConta() {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair do (TE)Ajudo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);

                            router.replace('/login');
                        } catch (erro) {
                            console.log(
                                'Erro ao sair da conta:',
                                erro
                            );

                            Alert.alert(
                                'Erro',
                                'Não foi possível sair da conta.'
                            );
                        }
                    },
                },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>
                <Pressable
                    style={styles.botaoVoltar}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color="#42A5D5"
                    />
                </Pressable>

                <Text style={styles.tituloCabecalho}>
                    Configurações
                </Text>

                <View style={styles.espacoCabecalho} />
            </View>

            {/* PERFIL */}
            <View style={styles.perfil}>
                <Pressable
                    style={styles.avatar}
                    onPress={() => {
                        if (!fotoPerfil) {
                            escolherFotoPerfil();
                            return;
                        }

                        Alert.alert(
                            'Foto de perfil',
                            'O que você deseja fazer?',
                            [
                                {
                                    text: 'Trocar foto',
                                    onPress: escolherFotoPerfil,
                                },
                                {
                                    text: 'Excluir foto',
                                    style: 'destructive',
                                    onPress: excluirFotoPerfil,
                                },
                                {
                                    text: 'Cancelar',
                                    style: 'cancel',
                                },
                            ]
                        );
                    }}
                >
                    {fotoPerfil ? (
                        <Image
                            source={{ uri: fotoPerfil }}
                            style={styles.fotoPerfil}
                        />
                    ) : (
                        <Ionicons
                            name="person-outline"
                            size={38}
                            color="#42A5D5"
                        />
                    )}
                    <View style={styles.botaoCamera}>
                        <Ionicons
                            name="camera-outline"
                            size={14}
                            color="#FFFFFF"
                        />
                    </View>
                </Pressable>

                <Text style={styles.nome}>
                    {usuario?.displayName || 'Responsável'}
                </Text>

                <Text style={styles.email}>
                    {usuario?.email || 'E-mail não disponível'}
                </Text>
            </View>
            <Text style={styles.tituloSecao}>
                Minha conta
            </Text>

            <View style={styles.card}>
                <Pressable
                    style={styles.item}
                    onPress={() => router.push('/dados-conta')}
                >
                    <View style={styles.iconeAzul}>
                        <Ionicons
                            name="person-outline"
                            size={22}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.textoItem}>
                        <Text style={styles.tituloItem}>
                            Dados da conta
                        </Text>

                        <Text style={styles.descricaoItem}>
                            Nome e e-mail utilizados no (TE)Ajudo
                        </Text>
                    </View>
                </Pressable>

                <View style={styles.divisor} /><View style={styles.divisor} />

                <Pressable
                    style={styles.item}
                    onPress={() => router.push('/seguranca')}
                >
                    <View style={styles.iconeAmarelo}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={22}
                            color="#FF7FA3"
                        />
                    </View>

                    <View style={styles.textoItem}>
                        <Text style={styles.tituloItem}>
                            Segurança
                        </Text>

                        <Text style={styles.descricaoItem}>
                            Senha e acesso à sua conta
                        </Text>
                    </View>
                </Pressable>
            </View>

            <Text style={styles.tituloSecao}>
                (TE)Ajudo
            </Text>

            <View style={styles.card}>

                <Pressable
                    style={styles.item}
                    onPress={() => router.push('/sobre')}
                >
                    <View style={styles.iconeRosa}>
                        <Ionicons
                            name="heart-outline"
                            size={22}
                            color="#FF7FA3"
                        />
                    </View>

                    <View style={styles.textoItem}>
                        <Text style={styles.tituloItem}>
                            Sobre o (TE)Ajudo
                        </Text>

                        <Text style={styles.descricaoItem}>
                            Apoio à maternidade atípica
                        </Text>
                    </View>
                </Pressable>
            </View>
            {
                ehAdmin && (
                    <>
                        <Text style={styles.tituloSecao}>
                            Administração
                        </Text>

                        <View style={styles.card}>
                            <Pressable
                                style={styles.item}
                                onPress={() => router.push('/admin')}
                            >
                                <View style={styles.iconeAzul}>
                                    <Text style={styles.emoji}>
                                        ⚙️
                                    </Text>
                                </View>

                                <View style={styles.textoItem}>
                                    <Text style={styles.tituloItem}>
                                        Painel administrativo
                                    </Text>

                                    <Text style={styles.descricaoItem}>
                                        Gerencie os conteúdos do (TE)Ajudo
                                    </Text>
                                </View>

                                <Text
                                    style={{
                                        color: '#8A969B',
                                        fontSize: 24,
                                    }}
                                >
                                    ›
                                </Text>
                            </Pressable>
                        </View>
                    </>
                )
            }
            {/* LOGOUT */}
            <Pressable
                style={styles.botaoSair}
                onPress={sairDaConta}
            >
                <Ionicons
                    name="log-out-outline"
                    size={19}
                    color="#D96888"
                    style={{ marginRight: 7 }}
                />

                <Text style={styles.textoSair}>
                    Sair da conta
                </Text>
            </Pressable>

            <Text style={styles.versao}>
                (TE)Ajudo • versão 1.0
            </Text>


        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
        paddingHorizontal: 20,
    },
    decoracaoFundo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },

    manchaRosaTopo: {
        position: 'absolute',
        width: 270,
        height: 210,
        borderRadius: 140,
        backgroundColor: '#FFE8F0',
        top: -105,
        left: -85,
        opacity: 0.85,
    },

    manchaAzulTopo: {
        position: 'absolute',
        width: 290,
        height: 210,
        borderRadius: 150,
        backgroundColor: '#E2F5FC',
        top: -115,
        right: -100,
        opacity: 0.9,
    },

    manchaRosaBaixo: {
        position: 'absolute',
        width: 350,
        height: 230,
        borderRadius: 180,
        backgroundColor: '#FFE5EE',
        bottom: -110,
        left: -130,
        opacity: 0.8,
    },

    manchaAzulBaixo: {
        position: 'absolute',
        width: 360,
        height: 230,
        borderRadius: 190,
        backgroundColor: '#DCF3FC',
        bottom: -120,
        right: -150,
        opacity: 0.85,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 7,
        marginBottom: 25,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        color: '#4288AF',
        fontSize: 30,
        lineHeight: 31,
    },

    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },

    espacoCabecalho: {
        width: 36,
    },

    perfil: {
        alignItems: 'center',
        marginBottom: 27,
    },

    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        position: 'relative',
    },

    avatarEmoji: {
        fontSize: 43,
    },
    fotoPerfil: {
        width: '100%',
        height: '100%',
        borderRadius: 38,
    },
    botaoCamera: {
        position: 'absolute',
        right: -2,
        bottom: 7,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#42A5D5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    nome: {
        color: '#435159',
        fontSize: 19,
        fontWeight: '700',
    },

    email: {
        color: '#7D8B91',
        fontSize: 12,
        marginTop: 3,
    },

    tituloSecao: {
        color: '#46555D',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 3,
        marginBottom: 8,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginBottom: 20,
    },

    item: {
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconeAzul: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: '#E1F4FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    iconeAmarelo: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    iconeVerde: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: '#E2F3D9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emoji: {
        fontSize: 21,
    },

    textoItem: {
        flex: 1,
    },

    tituloItem: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    descricaoItem: {
        color: '#8A969B',
        fontSize: 10,
        marginTop: 3,
    },

    divisor: {
        height: 1,
        backgroundColor: '#EDF1F2',
        marginLeft: 57,
    },

    botaoSair: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3A8BA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
    },

    iconeSair: {
        color: '#D96888',
        fontSize: 20,
        fontWeight: '700',
        marginRight: 7,
    },

    textoSair: {
        color: '#D96888',
        fontSize: 14,
        fontWeight: '700',
    },

    versao: {
        color: '#91A0A5',
        fontSize: 9,
        textAlign: 'center',
        marginTop: 13,
    },

    iconeRosa: {
        width: 45,
        height: 45,
        borderRadius: 14,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
});