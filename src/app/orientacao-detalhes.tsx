import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
import { SafeAreaView } from 'react-native-safe-area-context';

type OrientacaoDetalhada = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao?: string;
    dicas?: string[];
    lembrete?: string;
};



export default function OrientacaoDetalhesScreen() {
    const params = useLocalSearchParams();

    const idParametro = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [orientacao, setOrientacao] =
        useState<OrientacaoDetalhada | null>(null);

    const [carregando, setCarregando] =
        useState(true);

    async function carregarOrientacao() {
        try {
            setCarregando(true);

            const resultado = await getDocs(
                collection(db, 'orientacoes')
            );

            const lista: OrientacaoDetalhada[] =
                resultado.docs.map((documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<
                        OrientacaoDetalhada,
                        'id'
                    >),
                }));

            const encontrada = lista.find(
                (item) => item.id === idParametro
            );

            setOrientacao(encontrada ?? null);
        } catch (erro) {
            console.log(
                'Erro ao carregar orientação:',
                erro
            );

            setOrientacao(null);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarOrientacao();
        }, [idParametro])
    );

    if (carregando) {
        return (
            <SafeAreaView style={styles.container}>
                <View pointerEvents="none" style={styles.decoracaoFundo}>
                    <View style={styles.manchaRosaTopo} />
                    <View style={styles.manchaAzulTopo} />
                    <View style={styles.manchaRosaBaixo} />
                    <View style={styles.manchaAzulBaixo} />
                </View>
                <View style={styles.erroContainer}>
                    <Text style={styles.erroEmoji}>
                        📚
                    </Text>

                    <Text style={styles.erroTitulo}>
                        Carregando orientação...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }
    if (!orientacao) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.erroContainer}>
                    <Text style={styles.erroEmoji}>📚</Text>

                    <Text style={styles.erroTitulo}>
                        Orientação não encontrada
                    </Text>

                    <Pressable
                        style={styles.botaoVoltarErro}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.textoBotaoVoltar}>
                            Voltar
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
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
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >
                {/* Cabeçalho */}
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
                        Orientação
                    </Text>

                    <View style={{ width: 36 }} />
                </View>

                {/* Apresentação */}
                <View style={styles.apresentacao}>
                    <View style={styles.iconePrincipal}>
                        <Ionicons
                            name={
                                orientacao.categoria === 'Crise Sensorial'
                                    ? 'options-outline'
                                    : orientacao.categoria === 'Comunicação'
                                        ? 'chatbubble-ellipses-outline'
                                        : orientacao.categoria === 'Rotinas'
                                            ? 'time-outline'
                                            : orientacao.categoria === 'Direitos'
                                                ? 'document-text-outline'
                                                : orientacao.categoria === 'Comportamento'
                                                    ? 'people-outline'
                                                    : 'document-text-outline'
                            }
                            size={30}
                            color="#42A5D5"
                        />
                    </View>

                    <Text style={styles.categoria}>
                        {orientacao.categoria}
                    </Text>

                    <Text style={styles.titulo}>
                        {orientacao.titulo}
                    </Text>
                </View>

                {/* Conteúdo */}
                <View style={styles.card}>
                    <View style={styles.cabecalhoSecao}>
                        <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color="#42A5D5"
                        />
                        <Text style={styles.tituloSecao}>
                            Entenda
                        </Text>
                    </View>

                    <Text style={styles.paragrafo}>
                        {orientacao.introducao ||
                            'Nenhuma introdução cadastrada.'}
                    </Text>

                    <View style={styles.divisor} />

                    <View style={styles.cabecalhoSecao}>
                        <Ionicons
                            name="bulb-outline"
                            size={20}
                            color="#FF7FA3"
                        />
                        <Text style={styles.tituloSecao}>
                            O que pode ajudar?
                        </Text>
                    </View>

                    {(orientacao.dicas ?? []).map((dica, index) => (
                        <View
                            key={index}
                            style={styles.itemDica}
                        >
                            <View style={styles.numero}>
                                <Text style={styles.numeroTexto}>
                                    {index + 1}
                                </Text>
                            </View>

                            <Text style={styles.textoDica}>
                                {dica}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.lembrete}>
                        <View style={styles.iconeLembrete}>
                            <Ionicons
                                name="bookmark-outline"
                                size={21}
                                color="#FF7FA3"
                            />
                        </View>

                        <View style={styles.textoLembreteContainer}>
                            <Text style={styles.tituloLembrete}>
                                Lembre-se
                            </Text>

                            <Text style={styles.textoLembrete}>
                                {orientacao.lembrete ||
                                    'Nenhum lembrete cadastrado.'}
                            </Text>
                        </View>
                    </View>
                </View>

                <Pressable
                    style={styles.botaoFinal}
                    onPress={() => router.back()}
                >
                    <Text style={styles.textoBotaoFinal}>
                        Voltar às orientações
                    </Text>
                </Pressable>


            </ScrollView>
        </SafeAreaView >
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

    tituloCabecalho: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 29,
    },

    apresentacao: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 15,
    },

    iconePrincipal: {
        width: 78,
        height: 78,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    emojiPrincipal: {
        fontSize: 40,
    },

    categoria: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
    },

    titulo: {
        color: '#40515A',
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },

    paragrafo: {
        color: '#66757B',
        fontSize: 13,
        lineHeight: 21,
    },

    divisor: {
        height: 1,
        backgroundColor: '#E7EFF2',
        marginVertical: 20,
    },

    itemDica: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },

    numero: {
        width: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#DDF3FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    numeroTexto: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
    },

    textoDica: {
        flex: 1,
        color: '#66757B',
        fontSize: 12,
        lineHeight: 19,
    },

    lembrete: {
        flexDirection: 'row',
        backgroundColor: '#FFF3C9',
        borderRadius: 17,
        padding: 14,
        marginTop: 8,
    },

    iconeLembrete: {
        fontSize: 24,
        marginRight: 10,
    },

    textoLembreteContainer: {
        flex: 1,
    },

    tituloLembrete: {
        color: '#665B3D',
        fontSize: 13,
        fontWeight: '700',
    },

    textoLembrete: {
        color: '#786F56',
        fontSize: 11,
        lineHeight: 17,
        marginTop: 3,
    },

    botaoFinal: {
        height: 52,
        backgroundColor: '#42A5D5',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },

    textoBotaoFinal: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 20,
    },

    decoracaoEmoji: {
        fontSize: 30,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },

    erroContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },

    erroEmoji: {
        fontSize: 50,
    },

    erroTitulo: {
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 15,
    },

    botaoVoltarErro: {
        backgroundColor: '#FF7FA3',
        borderRadius: 15,
        paddingHorizontal: 30,
        paddingVertical: 13,
        marginTop: 20,
    },

    textoBotaoVoltar: {
        color: '#FFFFFF',
        fontWeight: '700',
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
    cabecalhoSecao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
});