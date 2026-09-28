import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
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
            const dadosSalvos = await AsyncStorage.getItem('orientacoes');
            const migracaoFeita = await AsyncStorage.getItem(
                'orientacoes_iniciais_v1'
            );

            // Já existem orientações salvas
            if (dadosSalvos !== null) {
                const listaSalva: Orientacao[] = JSON.parse(dadosSalvos);

                // Faz isso UMA ÚNICA VEZ:
                // junta as 12 iniciais com as que você já cadastrou
                if (migracaoFeita !== 'sim') {
                    const idsSalvos = new Set(
                        listaSalva.map((item) => item.id)
                    );

                    const iniciaisQueFaltam = orientacoesIniciais.filter(
                        (item) => !idsSalvos.has(item.id)
                    );

                    const listaCompleta = [
                        ...orientacoesIniciais,
                        ...listaSalva.filter(
                            (item) =>
                                !orientacoesIniciais.some(
                                    (inicial) => inicial.id === item.id
                                )
                        ),
                    ];

                    await AsyncStorage.setItem(
                        'orientacoes',
                        JSON.stringify(listaCompleta)
                    );

                    await AsyncStorage.setItem(
                        'orientacoes_iniciais_v1',
                        'sim'
                    );

                    setOrientacoes(listaCompleta);

                    console.log(
                        'Migração concluída. Quantidade:',
                        listaCompleta.length
                    );

                    return;
                }

                // Depois da migração, apenas lê o que está salvo.
                // Isso permite excluir itens sem eles reaparecerem.
                setOrientacoes(listaSalva);

                console.log(
                    'ORIENTAÇÕES CARREGADAS:',
                    listaSalva.length
                );

                return;
            }

            // Caso não exista absolutamente nada salvo
            await AsyncStorage.setItem(
                'orientacoes',
                JSON.stringify(orientacoesIniciais)
            );

            await AsyncStorage.setItem(
                'orientacoes_iniciais_v1',
                'sim'
            );

            setOrientacoes(orientacoesIniciais);
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
            const novaLista = orientacoes.filter(
                (item) => item.id !== id
            );

            await AsyncStorage.setItem(
                'orientacoes',
                JSON.stringify(novaLista)
            );

            setOrientacoes(novaLista);

            Alert.alert(
                'Orientação excluída',
                'O conteúdo foi removido com sucesso.'
            );
        } catch (erro) {
            console.log('Erro ao excluir orientação:', erro);

            Alert.alert(
                'Erro',
                'Não foi possível excluir a orientação.'
            );
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

                    <Text style={styles.tituloCabecalho}>
                        Gerenciar orientações
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* INTRODUÇÃO */}
                <View style={styles.introducao}>
                    <View style={styles.iconeIntroducao}>
                        <Text style={styles.emojiIntroducao}>
                            📚
                        </Text>
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
                        <Text style={styles.emojiVazio}>
                            📚
                        </Text>

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
                                    <Text style={styles.emojiCard}>
                                        {item.icone}
                                    </Text>
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
                                    <Text style={styles.opcoes}>
                                        •••
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                {/* DECORAÇÃO */}
                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>
                        🧩
                    </Text>

                    <Text style={styles.coracao}>
                        ♥
                    </Text>

                    <Text style={styles.decoracaoEmoji}>
                        🌈
                    </Text>
                </View>
            </ScrollView>

            {/* BOTÃO + */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() => router.push('/nova-orientacao')}
            >
                <Text style={styles.mais}>
                    +
                </Text>
            </Pressable>
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

    seta: {
        color: '#4288AF',
        fontSize: 30,
        lineHeight: 31,
    },

    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 8,
    },

    estrela: {
        width: 36,
        color: '#FFD447',
        fontSize: 29,
        textAlign: 'center',
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
        backgroundColor: '#DDF3FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiIntroducao: {
        fontSize: 29,
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
    },

    iconeCard: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    emojiCard: {
        fontSize: 25,
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

    opcoes: {
        color: '#9DA8AC',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 1,
    },

    botaoAdicionar: {
        position: 'absolute',
        right: 22,
        bottom: 25,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FF7FA3',
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

    mais: {
        color: '#FFFFFF',
        fontSize: 35,
        fontWeight: '300',
        marginTop: -3,
    },

    listaVazia: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    emojiVazio: {
        fontSize: 38,
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

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 24,
    },

    decoracaoEmoji: {
        fontSize: 30,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
});