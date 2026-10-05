import { router, useFocusEffect } from 'expo-router';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

type Orientacao = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao?: string;
    dicas?: string[];
    lembrete?: string;
};

const orientacoesIniciais: Orientacao[] = [
    {
        id: '1',
        titulo: 'Como agir em uma crise sensorial',
        categoria: 'Crise Sensorial',
        icone: '🧩',
    },
    {
        id: '2',
        titulo: 'Identificando sinais de sobrecarga',
        categoria: 'Crise Sensorial',
        icone: '💙',
    },
    {
        id: '3',
        titulo: 'Criando um ambiente mais tranquilo',
        categoria: 'Crise Sensorial',
        icone: '☁️',
    },
    {
        id: '4',
        titulo: 'Incentivando a comunicação',
        categoria: 'Comunicação',
        icone: '💬',
    },
    {
        id: '5',
        titulo: 'Comunicação além da fala',
        categoria: 'Comunicação',
        icone: '🗨️',
    },
    {
        id: '6',
        titulo: 'Dando tempo para responder',
        categoria: 'Comunicação',
        icone: '⏳',
    },
    {
        id: '7',
        titulo: 'Criando uma rotina previsível',
        categoria: 'Rotinas',
        icone: '🌈',
    },
    {
        id: '8',
        titulo: 'Preparando para mudanças',
        categoria: 'Rotinas',
        icone: '📅',
    },
    {
        id: '9',
        titulo: 'Rotina visual',
        categoria: 'Rotinas',
        icone: '🖼️',
    },
    {
        id: '10',
        titulo: 'Conhecendo os direitos',
        categoria: 'Direitos',
        icone: '⚖️',
    },
    {
        id: '11',
        titulo: 'Inclusão no ambiente escolar',
        categoria: 'Direitos',
        icone: '🎒',
    },
    {
        id: '12',
        titulo: 'Atendimento prioritário',
        categoria: 'Direitos',
        icone: '⭐',
    },
];

export default function AdminOrientacoesScreen() {
    const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);

    // Carrega as orientações salvas
    async function carregarOrientacoes() {
        try {
            const resultado = await getDocs(
                collection(db, 'orientacoes')
            );

            const lista: Orientacao[] = resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<Orientacao, 'id'>),
                })
            );

            setOrientacoes(lista);

            console.log(
                'ORIENTAÇÕES ADMIN DO FIREBASE:',
                lista.length
            );
        } catch (erro) {
            console.log(
                'Erro ao carregar orientações:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar as orientações.'
            );
        }
    }
    // Recarrega sempre que voltar para esta tela
    useFocusEffect(
        useCallback(() => {
            carregarOrientacoes();
        }, [])
    );

    function abrirOpcoes(item: Orientacao) {
        Alert.alert(
            item.titulo,
            'O que você deseja fazer?',
            [
                {
                    text: 'Editar',
                    onPress: () => {
                        router.push({
                            pathname: '/editar-orientacao',
                            params: {
                                id: item.id,
                            },
                        });
                    },
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => confirmarExclusao(item),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    }

    function confirmarExclusao(item: Orientacao) {
        Alert.alert(
            'Excluir orientação',
            `Deseja realmente excluir "${item.titulo}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => excluirOrientacao(item.id),
                },
            ]
        );
    }

    async function excluirOrientacao(id: string) {
        try {
            await deleteDoc(
                doc(db, 'orientacoes', id)
            );

            setOrientacoes((listaAtual) =>
                listaAtual.filter(
                    (item) => item.id !== id
                )
            );

            Alert.alert(
                'Orientação excluída',
                'O conteúdo foi removido com sucesso.'
            );
        } catch (erro) {
            console.log(
                'Erro ao excluir orientação:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível excluir a orientação.'
            );
        }
    } function iconeDaCategoria(categoria: string) {
        const categoriaNormalizada = categoria.toLowerCase();

        if (categoriaNormalizada.includes('sensorial')) {
            return 'options-outline';
        }

        if (categoriaNormalizada.includes('comunica')) {
            return 'chatbubbles-outline';
        }

        if (categoriaNormalizada.includes('rotina')) {
            return 'time-outline';
        }

        if (categoriaNormalizada.includes('direito')) {
            return 'document-text-outline';
        }

        return 'book-outline';
    }
    return (
        <SafeAreaView style={styles.container}>
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
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
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#42A5D5"
                        />
                    </Pressable>

                    <Text style={styles.tituloCabecalho}>
                        Gerenciar orientações
                    </Text>

                    <View style={{ width: 36 }} />
                </View>

                {/* INTRODUÇÃO */}
                <View style={styles.introducao}>
                    <View style={styles.iconeIntroducao}>
                        <Ionicons
                            name="library-outline"
                            size={26}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.textoIntroducao}>
                        <Text style={styles.tituloIntroducao}>
                            Conteúdos do TEAjudo
                        </Text>

                        <Text style={styles.subtituloIntroducao}>
                            Cadastre, edite e exclua orientações disponíveis
                            para os responsáveis.
                        </Text>
                    </View>
                </View>

                {/* TÍTULO DA LISTA */}
                <View style={styles.cabecalhoLista}>
                    <Text style={styles.tituloSecao}>
                        Orientações cadastradas
                    </Text>

                    <Text style={styles.quantidade}>
                        {orientacoes.length}{' '}
                        {orientacoes.length === 1
                            ? 'conteúdo'
                            : 'conteúdos'}
                    </Text>
                </View>

                {/* LISTA */}
                {orientacoes.length === 0 ? (
                    <View style={styles.listaVazia}>
                        <View style={styles.iconeVazio}>
                            <Ionicons
                                name="library-outline"
                                size={28}
                                color="#42A5D5"
                            />
                        </View>

                        <Text style={styles.tituloVazio}>
                            Nenhuma orientação cadastrada
                        </Text>

                        <Text style={styles.textoVazio}>
                            Toque no botão + para cadastrar uma orientação.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.lista}>
                        {orientacoes.map((item) => (
                            <View
                                key={item.id}
                                style={styles.card}
                            >
                                <View style={styles.iconeCard}>
                                    <Ionicons
                                        name={iconeDaCategoria(item.categoria) as any}
                                        size={23}
                                        color="#42A5D5"
                                    />
                                </View>

                                <View style={styles.conteudoCard}>
                                    <Text style={styles.categoria}>
                                        {item.categoria}
                                    </Text>

                                    <Text
                                        style={styles.tituloCard}
                                        numberOfLines={2}
                                    >
                                        {item.titulo}
                                    </Text>
                                </View>

                                <Pressable
                                    style={styles.botaoOpcoes}
                                    onPress={() => abrirOpcoes(item)}
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name="ellipsis-horizontal"
                                        size={21}
                                        color="#8B979C"
                                    />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}


            </ScrollView>

            {/* BOTÃO + */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() => router.push('/nova-orientacao')}
            >
                <Ionicons
                    name="add"
                    size={29}
                    color="#FFFFFF"
                />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
    },

    conteudo: {
        paddingHorizontal: 18,
        paddingBottom: 105,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 22,
    },

    botaoVoltar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },


    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 8,
    },

    introducao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 23,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    iconeIntroducao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },



    textoIntroducao: {
        flex: 1,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    subtituloIntroducao: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 4,
    },

    cabecalhoLista: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    quantidade: {
        color: '#42A5D5',
        fontSize: 10,
    },

    lista: {
        gap: 10,
    },

    card: {
        minHeight: 86,
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E7F0F3',
    },

    iconeCard: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },



    conteudoCard: {
        flex: 1,
    },

    categoria: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 3,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '700',
    },

    botaoOpcoes: {
        width: 36,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },



    botaoAdicionar: {
        position: 'absolute',
        right: 22,
        bottom: 25,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#42A5D5',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 7,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 4,
    },



    listaVazia: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: 'center',
    },


    tituloVazio: {
        color: '#46545B',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
    },

    textoVazio: {
        color: '#929DA2',
        fontSize: 10,
        marginTop: 5,
        textAlign: 'center',
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
    iconeVazio: {
        width: 54,
        height: 54,
        borderRadius: 17,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
});