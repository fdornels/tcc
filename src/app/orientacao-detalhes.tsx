import AsyncStorage from '@react-native-async-storage/async-storage';

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

            const dadosSalvos =
                await AsyncStorage.getItem('orientacoes');

            if (!dadosSalvos) {
                setOrientacao(null);
                return;
            }

            const lista: OrientacaoDetalhada[] =
                JSON.parse(dadosSalvos);

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
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.tituloCabecalho}>
                        Orientação
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Apresentação */}
                <View style={styles.apresentacao}>
                    <View style={styles.iconePrincipal}>
                        <Text style={styles.emojiPrincipal}>
                            {orientacao.icone}
                        </Text>
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
                    <Text style={styles.tituloSecao}>
                        💙 Entenda
                    </Text>

                    <Text style={styles.paragrafo}>
                        {orientacao.introducao ||
                            'Nenhuma introdução cadastrada.'}
                    </Text>

                    <View style={styles.divisor} />

                    <Text style={styles.tituloSecao}>
                        🌈 O que pode ajudar?
                    </Text>

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
                        <Text style={styles.iconeLembrete}>
                            ⭐
                        </Text>

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

                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>☁️</Text>
                    <Text style={styles.coracao}>♥</Text>
                    <Text style={styles.decoracaoEmoji}>🌈</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
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
        backgroundColor: '#FF7FA3',
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
});