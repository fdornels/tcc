import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
type Comentario = {
    id: string;
    autorId: string;
    autorNome: string;
    texto: string;
    criadoEm?: any;
};
export default function PublicacaoDetalhesScreen() {
    const params = useLocalSearchParams<{
        id?: string;
        titulo?: string;
        texto?: string;
        categoria?: string;
        autorNome?: string;
        autorId?: string;
    }>();
    const [resposta, setResposta] = useState('');
    const [comentarios, setComentarios] =
        useState<Comentario[]>([]);
    const [ehAdmin, setEhAdmin] = useState(false);
    const titulo = params.titulo ?? '';
    const texto = params.texto ?? '';
    const categoria = params.categoria ?? '';
    const autorNome = params.autorNome ?? 'Responsável';
    const publicacaoId = params.id ?? '';
    const autorId = params.autorId ?? '';

    const ehAutor =
        auth.currentUser?.uid === autorId;

    const podeExcluir =
        ehAutor || ehAdmin;
    async function carregarComentarios() {
        if (!publicacaoId) {
            setComentarios([]);
            return;
        }

        try {
            const referencia = query(
                collection(
                    db,
                    'publicacoes',
                    publicacaoId,
                    'comentarios'
                ),
                orderBy('criadoEm', 'asc')
            );

            const resultado = await getDocs(referencia);

            const lista: Comentario[] =
                resultado.docs.map((documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<
                        Comentario,
                        'id'
                    >),
                }));

            setComentarios(lista);
        } catch (erro) {
            console.log(
                'Erro ao carregar respostas:',
                erro
            );
        }
    }
    useFocusEffect(
        useCallback(() => {
            carregarComentarios();
            verificarAdmin();
        }, [publicacaoId])
    );
    async function enviarResposta() {
        if (!resposta.trim()) {
            Alert.alert(
                'Atenção',
                'Escreva uma resposta antes de enviar.'
            );
            return;
        }

        const usuario = auth.currentUser;

        if (!usuario) {
            Alert.alert(
                'Erro',
                'Você precisa estar conectada para responder.'
            );
            return;
        }

        if (!publicacaoId) {
            Alert.alert(
                'Erro',
                'Não foi possível identificar a publicação.'
            );
            return;
        }

        try {
            await addDoc(
                collection(
                    db,
                    'publicacoes',
                    publicacaoId,
                    'comentarios'
                ),
                {
                    autorId: usuario.uid,

                    autorNome:
                        usuario.displayName ||
                        usuario.email?.split('@')[0] ||
                        'Responsável',

                    texto: resposta.trim(),

                    criadoEm: serverTimestamp(),
                }
            );

            setResposta('');
            await carregarComentarios();
            Alert.alert(
                'Resposta enviada! 💙',
                'Sua resposta foi adicionada à conversa.'
            );
        } catch (erro) {
            console.log(
                'Erro ao enviar resposta:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível enviar sua resposta.'
            );
        }
    }
    async function excluirPublicacao() {
        if (!publicacaoId) {
            return;
        }

        Alert.alert(
            'Excluir publicação',
            'Tem certeza que deseja excluir esta publicação?',
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
                            await deleteDoc(
                                doc(
                                    db,
                                    'publicacoes',
                                    publicacaoId
                                )
                            );

                            Alert.alert(
                                'Publicação excluída',
                                'A publicação foi removida da comunidade.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () =>
                                            router.replace(
                                                '/comunidade'
                                            ),
                                    },
                                ]
                            );
                        } catch (erro) {
                            console.log(
                                'Erro ao excluir publicação:',
                                erro
                            );

                            Alert.alert(
                                'Erro',
                                'Não foi possível excluir a publicação.'
                            );
                        }
                    },
                },
            ]
        );
    }
    async function verificarAdmin() {
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                setEhAdmin(false);
                return;
            }

            const documentoUsuario = await getDoc(
                doc(
                    db,
                    'usuarios',
                    usuario.uid
                )
            );

            setEhAdmin(
                documentoUsuario.exists() &&
                documentoUsuario.data().admin === true
            );
        } catch (erro) {
            console.log(
                'Erro ao verificar administrador:',
                erro
            );

            setEhAdmin(false);
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >
                {/* CABEÇALHO */}
                <View style={styles.cabecalho}>
                    <Pressable
                        style={styles.botaoVoltar}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.tituloPagina}>
                        Publicação
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* PUBLICAÇÃO */}
                <View style={styles.cardPublicacao}>
                    <View style={styles.topo}>
                        <View style={styles.categoria}>
                            <Text style={styles.textoCategoria}>
                                {categoria || 'Comunidade'}
                            </Text>
                        </View>

                        <Text style={styles.icone}>💬</Text>
                    </View>

                    <Text style={styles.titulo}>
                        {titulo}
                    </Text>

                    <Text style={styles.texto}>
                        {texto}
                    </Text>

                    <View style={styles.divisor} />

                    <View style={styles.autor}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarEmoji}>
                                👤
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.publicadoPor}>
                                Publicado por
                            </Text>

                            <Text style={styles.nomeAutor}>
                                {autorNome}
                            </Text>
                        </View>
                    </View>
                </View>
                {podeExcluir ? (
                    <Pressable
                        style={styles.botaoExcluir}
                        onPress={excluirPublicacao}
                    >
                        <Text style={styles.textoExcluir}>
                            {ehAutor
                                ? '🗑️ Excluir minha publicação'
                                : '🗑️ Remover publicação'}
                        </Text>
                    </Pressable>
                ) : null}
                {/* COMENTÁRIOS */}
                <Text style={styles.tituloSecao}>
                    Respostas
                </Text>
                <View style={styles.caixaResposta}>
                    <TextInput
                        style={styles.inputResposta}
                        value={resposta}
                        onChangeText={setResposta}
                        placeholder="Escreva uma resposta..."
                        placeholderTextColor="#9AA5AA"
                        multiline
                        maxLength={500}
                    />

                    <Pressable
                        style={styles.botaoResponder}
                        onPress={enviarResposta}
                    >
                        <Text style={styles.textoBotaoResponder}>
                            Responder
                        </Text>
                    </Pressable>
                </View>
                {comentarios.length === 0 ? (
                    <View style={styles.cardVazio}>
                        <Text style={styles.emojiVazio}>💭</Text>

                        <Text style={styles.tituloVazio}>
                            Nenhuma resposta ainda
                        </Text>

                        <Text style={styles.textoVazio}>
                            Seja a primeira pessoa a participar
                            desta conversa.
                        </Text>
                    </View>
                ) : (
                    comentarios.map((comentario) => (
                        <View
                            key={comentario.id}
                            style={styles.cardComentario}
                        >
                            <View style={styles.topoComentario}>
                                <View style={styles.avatarComentario}>
                                    <Text style={styles.avatarComentarioEmoji}>
                                        👤
                                    </Text>
                                </View>

                                <View style={styles.infoComentario}>
                                    <Text style={styles.autorComentario}>
                                        {comentario.autorNome}
                                    </Text>

                                    <Text style={styles.respostaLabel}>
                                        Resposta
                                    </Text>
                                </View>

                                <Text style={styles.balaoComentario}>
                                    💬
                                </Text>
                            </View>

                            <Text style={styles.textoComentario}>
                                {comentario.texto}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF5FC',
    },

    conteudo: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    cabecalho: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    botaoVoltar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        fontSize: 30,
        color: '#4DA4CF',
        marginTop: -4,
    },

    tituloPagina: {
        fontSize: 19,
        fontWeight: '700',
        color: '#4B5A60',
    },

    estrela: {
        fontSize: 26,
        color: '#F6C945',
    },

    cardPublicacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
    },

    topo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    categoria: {
        backgroundColor: '#EAF8FC',
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 6,
    },

    textoCategoria: {
        color: '#4DA4CF',
        fontSize: 11,
        fontWeight: '700',
    },

    icone: {
        fontSize: 21,
    },

    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 12,
    },

    texto: {
        fontSize: 14,
        lineHeight: 22,
        color: '#65767D',
    },

    divisor: {
        height: 1,
        backgroundColor: '#EDF1F2',
        marginVertical: 20,
    },

    autor: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#EAF8FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    avatarEmoji: {
        fontSize: 20,
    },

    publicadoPor: {
        fontSize: 10,
        color: '#9AA5AA',
        marginBottom: 2,
    },

    nomeAutor: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4B5A60',
    },

    tituloSecao: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 10,
        marginLeft: 2,
    },

    cardVazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        minHeight: 160,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },

    emojiVazio: {
        fontSize: 32,
        marginBottom: 8,
    },

    tituloVazio: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 5,
    },

    textoVazio: {
        fontSize: 11,
        lineHeight: 16,
        color: '#9AA5AA',
        textAlign: 'center',
    },
    caixaResposta: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 14,
        marginBottom: 14,
    },

    inputResposta: {
        minHeight: 75,
        fontSize: 13,
        lineHeight: 19,
        color: '#4B5A60',
        textAlignVertical: 'top',
        padding: 5,
    },

    botaoResponder: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF6F9C',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 9,
        marginTop: 7,
    },

    textoBotaoResponder: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    cardComentario: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
    },

    topoComentario: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    avatarComentario: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#EAF8FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    avatarComentarioEmoji: {
        fontSize: 18,
    },

    infoComentario: {
        flex: 1,
    },

    autorComentario: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4B5A60',
    },

    respostaLabel: {
        fontSize: 9,
        color: '#9AA5AA',
        marginTop: 2,
    },

    balaoComentario: {
        fontSize: 17,
    },

    textoComentario: {
        fontSize: 13,
        lineHeight: 20,
        color: '#65767D',
    },
    botaoExcluir: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginTop: -12,
        marginBottom: 20,
    },

    textoExcluir: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D85C73',
    },
});