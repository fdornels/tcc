import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

        const fotoSalva =
            `${FileSystem.documentDirectory}perfil/${usuarioAtual.uid}.jpg`;

        const infoFoto = await FileSystem.getInfoAsync(fotoSalva);

        if (infoFoto.exists) {
            setFotoPerfil(`${fotoSalva}?t=${Date.now()}`);
        } else {
            setFotoPerfil(null);
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

        if (!resultado.canceled) {
            try {
                const usuarioAtual = auth.currentUser;

                if (!usuarioAtual) {
                    Alert.alert(
                        'Erro',
                        'Você precisa estar conectada para alterar a foto.'
                    );
                    return;
                }

                const uri = resultado.assets[0].uri;

                const pastaFotos = `${FileSystem.documentDirectory}perfil/`;
                const fotoSalva = `${pastaFotos}${usuarioAtual.uid}.jpg`;

                const infoPasta = await FileSystem.getInfoAsync(pastaFotos);

                if (!infoPasta.exists) {
                    await FileSystem.makeDirectoryAsync(pastaFotos, {
                        intermediates: true,
                    });
                }

                const fotoAntiga = await FileSystem.getInfoAsync(fotoSalva);

                if (fotoAntiga.exists) {
                    await FileSystem.deleteAsync(fotoSalva, {
                        idempotent: true,
                    });
                }


                await FileSystem.copyAsync({
                    from: uri,
                    to: fotoSalva,
                });

                setFotoPerfil(`${fotoSalva}?t=${Date.now()}`);

                Alert.alert(
                    'Foto atualizada! 💙',
                    'Sua foto de perfil foi salva com sucesso.'
                );
            } catch (erro) {
                console.log('Erro ao salvar foto:', erro);

                Alert.alert(
                    'Erro',
                    'Não foi possível salvar sua foto de perfil.'
                );
            }
        }
    }
    async function sairDaConta() {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair do TEAjudo?',
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
            {/* CABEÇALHO */}
            <View style={styles.cabecalho}>
                <Pressable
                    style={styles.botaoVoltar}
                    onPress={() => router.back()}
                >
                    <Text style={styles.seta}>‹</Text>
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
                    onPress={escolherFotoPerfil}
                >
                    {fotoPerfil ? (
                        <Image
                            source={{ uri: fotoPerfil }}
                            style={styles.fotoPerfil}
                        />
                    ) : (
                        <Text style={styles.avatarEmoji}>👤</Text>
                    )}
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
                        <Text style={styles.emoji}>
                            👤
                        </Text>
                    </View>

                    <View style={styles.textoItem}>
                        <Text style={styles.tituloItem}>
                            Dados da conta
                        </Text>

                        <Text style={styles.descricaoItem}>
                            Nome e e-mail utilizados no
                            TEAjudo
                        </Text>
                    </View>
                </Pressable>

                <View style={styles.divisor} /><View style={styles.divisor} />

                <Pressable
                    style={styles.item}
                    onPress={() => router.push('/seguranca')}
                >
                    <View style={styles.iconeAmarelo}>
                        <Text style={styles.emoji}>
                            🔒
                        </Text>
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
                TEAjudo
            </Text>

            <View style={styles.card}>

                <Pressable
                    style={styles.item}
                    onPress={() => router.push('/sobre')}
                >
                    <View style={styles.iconeVerde}>
                        <Text style={styles.emoji}>
                            💙
                        </Text>
                    </View>

                    <View style={styles.textoItem}>
                        <Text style={styles.tituloItem}>
                            Sobre o TEAjudo
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
                                        Gerencie os conteúdos do TEAjudo
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
                <Text style={styles.iconeSair}>
                    ↪
                </Text>

                <Text style={styles.textoSair}>
                    Sair da conta
                </Text>
            </Pressable>

            <Text style={styles.versao}>
                TEAjudo • versão 1.0
            </Text>

            <View style={styles.decoracao}>
                <Text style={styles.decoracaoEmoji}>
                    🌈
                </Text>

                <Text style={styles.infinito}>
                    ∞
                </Text>

                <Text style={styles.decoracaoEmoji}>
                    🧩
                </Text>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
        paddingHorizontal: 20,
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
    },

    avatarEmoji: {
        fontSize: 43,
    },
    fotoPerfil: {
        width: '100%',
        height: '100%',
        borderRadius: 38,
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
        backgroundColor: '#FFF1C7',
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

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 'auto',
        marginBottom: 15,
    },

    decoracaoEmoji: {
        fontSize: 29,
    },

    infinito: {
        color: '#72C99B',
        fontSize: 42,
        fontWeight: '700',
    },
});