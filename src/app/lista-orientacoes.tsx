

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';

import {
    useCallback,
    useState,
} from 'react';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
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

export default function ListaOrientacoesScreen() {
    const params = useLocalSearchParams();

    const [orientacoes, setOrientacoes] =
        useState<Orientacao[]>([]);

    const categoriaParametro = Array.isArray(params.categoria)
        ? params.categoria[0]
        : params.categoria;

    const categoria = categoriaParametro || 'Orientações';

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
        } catch (erro) {
            console.log(
                'Erro ao carregar orientações:',
                erro
            );

            setOrientacoes([]);
        }
    }
    useFocusEffect(
        useCallback(() => {
            carregarOrientacoes();
        }, [])
    );

    const listaFiltrada = orientacoes.filter(
        (item) => item.categoria === categoria
    );

    function voltar() {
        router.back();
    }

    function abrirOrientacao(item: Orientacao) {
        router.push({
            pathname: '/orientacao-detalhes',
            params: {
                id: item.id,
            },
        });
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
                {/* Cabeçalho */}
                <View style={styles.cabecalho}>
                    <Pressable
                        style={styles.botaoVoltar}
                        onPress={voltar}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#42A5D5"
                        />
                    </Pressable>

                    <Text style={styles.tituloPagina}>
                        {categoria}
                    </Text>

                    <View style={{ width: 36 }} />
                </View>



                {/* Quantidade */}
                <View style={styles.tituloConteudos}>
                    <View style={styles.iconeConteudos}>
                        <Ionicons
                            name={
                                categoria === 'Crise Sensorial'
                                    ? 'options-outline'
                                    : categoria === 'Comunicação'
                                        ? 'chatbubble-ellipses-outline'
                                        : categoria === 'Rotinas'
                                            ? 'time-outline'
                                            : categoria === 'Direitos'
                                                ? 'document-text-outline'
                                                : categoria === 'Comportamento'
                                                    ? 'people-outline'
                                                    : 'document-text-outline'
                            }
                            size={18}
                            color="#42A5D5"
                        />
                    </View>

                    <View>
                        <Text style={styles.tituloSecao}>
                            Conteúdos
                        </Text>


                    </View>
                </View>

                <Text style={styles.quantidade}>
                    {listaFiltrada.length}{' '}
                    {listaFiltrada.length === 1
                        ? 'orientação encontrada'
                        : 'orientações encontradas'}
                </Text>

                {/* Lista */}
                {listaFiltrada.length === 0 ? (
                    <View style={styles.vazio}>
                        <View style={styles.iconeVazio}>
                            <Ionicons
                                name="book-outline"
                                size={30}
                                color="#42A5D5"
                            />
                        </View>

                        <Text style={styles.tituloVazio}>
                            Nenhuma orientação encontrada
                        </Text>

                        <Text style={styles.textoVazio}>
                            Ainda não existem conteúdos nesta categoria.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.lista}>
                        {listaFiltrada.map((item) => (
                            <Pressable
                                key={item.id}
                                style={styles.card}
                                onPress={() => abrirOrientacao(item)}
                            >
                                <View style={styles.iconeCard}>
                                    <Ionicons
                                        name={
                                            item.categoria === 'Crise Sensorial'
                                                ? 'options-outline'
                                                : item.categoria === 'Comunicação'
                                                    ? 'chatbubble-ellipses-outline'
                                                    : item.categoria === 'Rotinas'
                                                        ? 'time-outline'
                                                        : item.categoria === 'Direitos'
                                                            ? 'document-text-outline'
                                                            : 'document-text-outline'
                                        }
                                        size={25}
                                        color="#42A5D5"
                                    />
                                </View>

                                <View style={styles.conteudoCard}>
                                    <Text style={styles.tituloCard}>
                                        {item.titulo}
                                    </Text>

                                    <Text
                                        style={styles.descricaoCard}
                                        numberOfLines={3}
                                    >
                                        {item.introducao ||
                                            'Toque para visualizar esta orientação.'}
                                    </Text>

                                    <Text style={styles.lerMais}>
                                        Ler orientação ›
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}


            </ScrollView>
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
        paddingBottom: 35,
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

    seta: {
        color: '#4288AF',
        fontSize: 30,
        lineHeight: 31,
    },

    tituloPagina: {
        flex: 1,
        paddingHorizontal: 10,
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
        textAlign: 'center',
    },

    estrela: {
        width: 36,
        color: '#FFD447',
        fontSize: 29,
        textAlign: 'center',
    },

    introducao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 23,
    },

    iconeIntroducao: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    textoIntroducao: {
        flex: 1,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
    },

    subtituloIntroducao: {
        color: '#7D898E',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 17,
        fontWeight: '700',
    },

    quantidade: {
        color: '#829096',
        fontSize: 11,
        marginTop: 4,
        marginBottom: 14,
    },

    lista: {
        gap: 11,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
    },

    iconeCard: {
        width: 63,
        height: 63,
        borderRadius: 17,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiCard: {
        fontSize: 30,
    },

    conteudoCard: {
        flex: 1,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 14,
        fontWeight: '700',
    },

    descricaoCard: {
        color: '#77858B',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 5,
    },

    lerMais: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 6,
    },

    vazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    iconeVazio: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    tituloVazio: {
        color: '#4D5A60',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
    },

    textoVazio: {
        color: '#929DA2',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 5,
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 25,
    },

    decoracaoEmoji: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
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
    tituloConteudos: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    iconeConteudos: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    subtituloConteudos: {
        color: '#8B979C',
        fontSize: 11,
        marginTop: 2,
    },
});