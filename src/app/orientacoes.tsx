import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { db } from '../../config/firebase';

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

type Orientacao = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao?: string;
    dicas?: string[];
    lembrete?: string;
};



export default function OrientacoesScreen() {
    const [busca, setBusca] = useState('');
    const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);

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
                'ORIENTAÇÕES DO FIREBASE:',
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
    useFocusEffect(
        useCallback(() => {
            carregarOrientacoes();
        }, [])
    );

    const textoBusca = busca.trim().toLowerCase();

    const resultados = orientacoes.filter((item) => {
        const titulo =
            item.titulo?.toLowerCase() ?? '';

        const introducao =
            item.introducao?.toLowerCase() ?? '';

        const categoria =
            item.categoria?.toLowerCase() ?? '';

        const dicas =
            item.dicas?.join(' ').toLowerCase() ?? '';

        const lembrete =
            item.lembrete?.toLowerCase() ?? '';

        return (
            titulo.includes(textoBusca) ||
            introducao.includes(textoBusca) ||
            categoria.includes(textoBusca) ||
            dicas.includes(textoBusca) ||
            lembrete.includes(textoBusca)
        );
    });

    const pesquisando = textoBusca.length > 0;

    function abrirOrientacao(id: string) {
        router.push({
            pathname: '/orientacao-detalhes',
            params: {
                id,
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
                keyboardShouldPersistTaps="handled"
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

                    <Text style={styles.titulo}>Orientações</Text>

                    <View style={styles.espacoCabecalho} />
                </View>

                {/* Busca */}
                <View style={styles.busca}>
                    <Ionicons
                        name="search-outline"
                        size={19}
                        color="#42A5D5"
                    />

                    <TextInput
                        style={styles.inputBusca}
                        placeholder="Buscar orientações..."
                        placeholderTextColor="#9AA6AB"
                        value={busca}
                        onChangeText={setBusca}
                        returnKeyType="search"
                    />

                    {pesquisando && (
                        <Pressable
                            style={styles.botaoLimpar}
                            onPress={() => setBusca('')}
                        >
                            <Text style={styles.textoLimpar}>×</Text>
                        </Pressable>
                    )}
                </View>

                {/* RESULTADOS DA BUSCA */}
                {pesquisando ? (
                    <>
                        <View style={styles.cabecalhoResultados}>
                            <Text style={styles.tituloSecao}>
                                Resultados
                            </Text>

                            <Text style={styles.quantidadeResultados}>
                                {resultados.length}{' '}
                                {resultados.length === 1
                                    ? 'encontrado'
                                    : 'encontrados'}
                            </Text>
                        </View>

                        {resultados.length === 0 ? (
                            <View style={styles.semResultados}>
                                <Text style={styles.emojiSemResultados}>
                                    🔎
                                </Text>

                                <Text style={styles.tituloSemResultados}>
                                    Nenhuma orientação encontrada
                                </Text>

                                <Text style={styles.textoSemResultados}>
                                    Tente pesquisar por outro termo.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.listaResultados}>
                                {resultados.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        style={styles.cardResultado}
                                        onPress={() =>
                                            abrirOrientacao(item.id)
                                        }
                                    >
                                        <View style={styles.iconeResultado}>
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

                                        <View style={styles.textoResultado}>
                                            <Text style={styles.categoriaResultado}>
                                                {item.categoria}
                                            </Text>

                                            <Text style={styles.tituloResultado}>
                                                {item.titulo}
                                            </Text>

                                            <Text
                                                style={styles.descricaoResultado}
                                                numberOfLines={2}
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
                    </>
                ) : (
                    <>
                        {/* Categorias */}
                        <Text style={styles.tituloSecao}>
                            Categorias
                        </Text>

                        <View style={styles.grade}>
                            <Pressable
                                style={[
                                    styles.cardCategoria,
                                    styles.azul,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/lista-orientacoes',
                                        params: {
                                            categoria: 'Crise Sensorial',
                                        },
                                    })
                                }
                            >
                                <View style={styles.iconeCategoriaAzul}>
                                    <Ionicons
                                        name="options-outline"
                                        size={24}
                                        color="#42A5D5"
                                    />
                                </View>

                                <Text style={styles.nomeCategoria}>
                                    Crise Sensorial
                                </Text>

                                <Text style={styles.descricaoCategoria}>
                                    Estratégias e dicas para momentos
                                    desafiadores
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.cardCategoria,
                                    styles.amarelo,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/lista-orientacoes',
                                        params: {
                                            categoria: 'Comunicação',
                                        },
                                    })
                                }
                            >
                                <View style={styles.iconeCategoriaRosa}>
                                    <Ionicons
                                        name="chatbubble-ellipses-outline"
                                        size={24}
                                        color="#FF7FA3"
                                    />
                                </View>

                                <Text style={styles.nomeCategoria}>
                                    Comunicação
                                </Text>

                                <Text style={styles.descricaoCategoria}>
                                    Apoio no desenvolvimento da comunicação
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.cardCategoria,
                                    styles.verde,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/lista-orientacoes',
                                        params: {
                                            categoria: 'Rotinas',
                                        },
                                    })
                                }
                            >
                                <View style={styles.iconeCategoriaAzul}>
                                    <Ionicons
                                        name="time-outline"
                                        size={24}
                                        color="#42A5D5"
                                    />
                                </View>

                                <Text style={styles.nomeCategoria}>
                                    Rotinas
                                </Text>

                                <Text style={styles.descricaoCategoria}>
                                    Organização e estrutura no dia a dia
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.cardCategoria,
                                    styles.roxo,
                                ]}
                                onPress={() =>
                                    router.push({
                                        pathname: '/lista-orientacoes',
                                        params: {
                                            categoria: 'Direitos',
                                        },
                                    })
                                }
                            >
                                <View style={styles.iconeCategoriaRosa}>
                                    <Ionicons
                                        name="document-text-outline"
                                        size={24}
                                        color="#FF7FA3"
                                    />
                                </View>

                                <Text style={styles.nomeCategoria}>
                                    Direitos
                                </Text>

                                <Text style={styles.descricaoCategoria}>
                                    Informações sobre direitos e benefícios
                                </Text>
                            </Pressable>
                        </View>

                        {/* Destaques */}
                        <Text style={styles.tituloSecao}>
                            Destaques
                        </Text>
                        {orientacoes.map((item, index) => (
                            <Pressable
                                key={item.id}
                                style={styles.cardDestaque}
                                onPress={() => abrirOrientacao(item.id)}
                            >
                                <View
                                    style={[
                                        styles.imagemDestaque,
                                        index % 2 === 0
                                            ? styles.destaqueAzul
                                            : styles.destaqueRosa,
                                    ]}
                                >
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
                                        size={27}
                                        color={index % 2 === 0 ? '#42A5D5' : '#FF7FA3'}
                                    />
                                </View>

                                <View style={styles.textoDestaque}>
                                    <Text style={styles.tituloDestaque}>
                                        {item.titulo}
                                    </Text>

                                    <Text
                                        style={styles.descricaoDestaque}
                                        numberOfLines={2}
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


                    </>
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
        paddingBottom: 125,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 7,
        marginBottom: 20,
    },
    espacoCabecalho: {
        width: 36,
        height: 36,
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

    titulo: {
        color: '#40515A',
        fontSize: 20,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 31,
    },

    busca: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 22,
    },

    iconeBusca: {
        color: '#42A5D5',
        fontSize: 22,
        marginRight: 8,
    },

    inputBusca: {
        flex: 1,
        color: '#46545B',
        fontSize: 13,
    },

    botaoLimpar: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoLimpar: {
        color: '#9AA6AB',
        fontSize: 25,
        lineHeight: 27,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },

    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    cardCategoria: {
        width: '48%',
        minHeight: 145,
        borderRadius: 19,
        padding: 14,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconeCategoriaAzul: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconeCategoriaRosa: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFEAF0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    azul: {
        backgroundColor: '#EDF8FC',
    },

    amarelo: {
        backgroundColor: '#FFF0F5',
    },

    verde: {
        backgroundColor: '#EDF8FC',
    },

    roxo: {
        backgroundColor: '#FFF0F5',
    },

    emoji: {
        fontSize: 33,
        marginBottom: 8,
    },

    nomeCategoria: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },

    descricaoCategoria: {
        color: '#77858B',
        fontSize: 9,
        lineHeight: 13,
        textAlign: 'center',
        marginTop: 5,
    },

    cardDestaque: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 9,
        flexDirection: 'row',
        marginBottom: 11,
    },

    imagemDestaque: {
        width: 82,
        height: 82,
        borderRadius: 16,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    destaqueAzul: {
        backgroundColor: '#EAF7FC',
    },

    destaqueRosa: {
        backgroundColor: '#FFF0F5',
    },
    imagemRosa: {
        backgroundColor: '#F8DDE6',
    },

    emojiDestaque: {
        fontSize: 38,
    },

    textoDestaque: {
        flex: 1,
        justifyContent: 'center',
    },

    tituloDestaque: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    descricaoDestaque: {
        color: '#77858B',
        fontSize: 10,
        lineHeight: 14,
        marginTop: 4,
    },

    lerMais: {
        color: '#42A5D5',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 6,
    },

    cabecalhoResultados: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    quantidadeResultados: {
        color: '#42A5D5',
        fontSize: 10,
        marginBottom: 12,
    },

    listaResultados: {
        gap: 11,
    },

    cardResultado: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        minHeight: 115,
    },

    iconeResultado: {
        width: 62,
        height: 62,
        borderRadius: 17,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiResultado: {
        fontSize: 29,
    },

    textoResultado: {
        flex: 1,
    },

    categoriaResultado: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 3,
    },

    tituloResultado: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    descricaoResultado: {
        color: '#77858B',
        fontSize: 10,
        lineHeight: 14,
        marginTop: 4,
    },

    semResultados: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    emojiSemResultados: {
        fontSize: 38,
    },

    tituloSemResultados: {
        color: '#46545B',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
    },

    textoSemResultados: {
        color: '#929DA2',
        fontSize: 11,
        marginTop: 5,
    },

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 18,
    },

    decoracaoEmoji: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },

    menuInferior: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        elevation: 8,
    },

    itemMenu: {
        flex: 1,
        alignItems: 'center',
    },

    menuIcone: {
        color: '#8B979C',
        fontSize: 22,
    },

    menuIconeAtivo: {
        color: '#42A5D5',
        fontSize: 22,
        fontWeight: '700',
    },

    menuTexto: {
        color: '#8B979C',
        fontSize: 9,
        marginTop: 4,
    },

    menuTextoAtivo: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 4,
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
});