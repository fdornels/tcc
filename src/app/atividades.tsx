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

type Atividade = {
    id: string;
    titulo: string;
    categoria: string;
    data: string;
    horario: string;
    descricao: string;
    observacoes: string;
};

const categorias = [
    {
        nome: 'Comunicação',
        icone: '💬',
        estilo: 'azul',
    },
    {
        nome: 'Alimentação',
        icone: '🍎',
        estilo: 'verde',
    },
    {
        nome: 'Escola',
        icone: '🎒',
        estilo: 'amarelo',
    },
    {
        nome: 'Sensorial',
        icone: '🧩',
        estilo: 'roxo',
    },
    {
        nome: 'Rotina',
        icone: '🌈',
        estilo: 'rosa',
    },
    {
        nome: 'Outros',
        icone: '⭐',
        estilo: 'azulClaro',
    },
];

export default function AtividadesScreen() {
    const [atividades, setAtividades] = useState<Atividade[]>([]);

    /*
     * Toda vez que a tela Atividades recebe foco,
     * buscamos novamente os dados no AsyncStorage.
     *
     * Assim, quando voltamos de "Nova atividade"
     * ou "Editar atividade", a lista é atualizada.
     */
    useFocusEffect(
        useCallback(() => {
            carregarAtividades();
        }, [])
    );

    async function carregarAtividades() {
        try {
            const dadosSalvos =
                await AsyncStorage.getItem('atividades');

            if (dadosSalvos) {
                const lista: Atividade[] = JSON.parse(dadosSalvos);

                /*
                 * Mostra as atividades mais novas primeiro.
                 */
                setAtividades([...lista].reverse());
            } else {
                setAtividades([]);
            }
        } catch (erro) {
            console.log('Erro ao carregar atividades:', erro);

            Alert.alert(
                'Erro',
                'Não foi possível carregar as atividades.'
            );
        }
    }

    function pegarIconeCategoria(categoria: string) {
        const categoriaEncontrada = categorias.find(
            (item) => item.nome === categoria
        );

        return categoriaEncontrada?.icone ?? '⭐';
    }

    /*
     * Abre as opções da atividade:
     * editar, excluir ou cancelar.
     */
    function abrirOpcoes(item: Atividade) {
        Alert.alert(
            item.titulo,
            'O que você deseja fazer?',
            [
                {
                    text: 'Editar',
                    onPress: () => {
                        router.push({
                            pathname: '/nova-atividade',
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

    /*
     * Confirma antes de excluir.
     */
    function confirmarExclusao(item: Atividade) {
        Alert.alert(
            'Excluir atividade',
            `Deseja realmente excluir "${item.titulo}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => excluirAtividade(item.id),
                },
            ]
        );
    }

    /*
     * Remove a atividade do AsyncStorage.
     */
    async function excluirAtividade(id: string) {
        try {
            const dadosSalvos =
                await AsyncStorage.getItem('atividades');

            if (!dadosSalvos) {
                return;
            }

            const listaAtual: Atividade[] =
                JSON.parse(dadosSalvos);

            const listaAtualizada = listaAtual.filter(
                (item) => item.id !== id
            );

            await AsyncStorage.setItem(
                'atividades',
                JSON.stringify(listaAtualizada)
            );

            /*
             * Recarrega a lista depois da exclusão.
             */
            await carregarAtividades();

            Alert.alert(
                'Atividade excluída',
                'A atividade foi removida com sucesso.'
            );
        } catch (erro) {
            console.log('Erro ao excluir atividade:', erro);

            Alert.alert(
                'Erro',
                'Não foi possível excluir a atividade.'
            );
        }
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
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.titulo}>
                        Atividades
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Introdução */}
                <View style={styles.introducao}>
                    <View>
                        <Text style={styles.tituloIntroducao}>
                            Acompanhe o dia a dia 💙
                        </Text>

                        <Text style={styles.subtitulo}>
                            Registre atividades e momentos importantes da criança.
                        </Text>
                    </View>
                </View>

                {/* Categorias */}
                <Text style={styles.tituloSecao}>
                    Categorias
                </Text>

                <View style={styles.grade}>
                    <View
                        style={[
                            styles.cardCategoria,
                            styles.azul,
                        ]}
                    >
                        <Text style={styles.emoji}>💬</Text>

                        <Text style={styles.nomeCategoria}>
                            Comunicação
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.cardCategoria,
                            styles.verde,
                        ]}
                    >
                        <Text style={styles.emoji}>🍎</Text>

                        <Text style={styles.nomeCategoria}>
                            Alimentação
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.cardCategoria,
                            styles.amarelo,
                        ]}
                    >
                        <Text style={styles.emoji}>🎒</Text>

                        <Text style={styles.nomeCategoria}>
                            Escola
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.cardCategoria,
                            styles.roxo,
                        ]}
                    >
                        <Text style={styles.emoji}>🧩</Text>

                        <Text style={styles.nomeCategoria}>
                            Sensorial
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.cardCategoria,
                            styles.rosa,
                        ]}
                    >
                        <Text style={styles.emoji}>🌈</Text>

                        <Text style={styles.nomeCategoria}>
                            Rotina
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.cardCategoria,
                            styles.azulClaro,
                        ]}
                    >
                        <Text style={styles.emoji}>⭐</Text>

                        <Text style={styles.nomeCategoria}>
                            Outros
                        </Text>
                    </View>
                </View>

                {/* Atividades recentes */}
                <View style={styles.tituloRegistros}>
                    <Text style={styles.tituloSecao}>
                        Atividades recentes
                    </Text>

                    {atividades.length > 0 && (
                        <Text style={styles.quantidade}>
                            {atividades.length}{' '}
                            {atividades.length === 1
                                ? 'registro'
                                : 'registros'}
                        </Text>
                    )}
                </View>

                {/* Sem atividades */}
                {atividades.length === 0 ? (
                    <View style={styles.semAtividades}>
                        <Text style={styles.iconeVazio}>
                            ✏️
                        </Text>

                        <Text style={styles.textoVazio}>
                            Nenhuma atividade registrada.
                        </Text>

                        <Text style={styles.subtextoVazio}>
                            Toque no botão + para registrar a primeira.
                        </Text>
                    </View>
                ) : (
                    /* Lista das atividades */
                    <View style={styles.listaAtividades}>
                        {atividades.map((item) => (
                            <View
                                key={item.id}
                                style={styles.cardAtividade}
                            >
                                <View style={styles.iconeAtividade}>
                                    <Text style={styles.emojiAtividade}>
                                        {pegarIconeCategoria(item.categoria)}
                                    </Text>
                                </View>

                                <View style={styles.informacoesAtividade}>
                                    <Text
                                        style={styles.tituloAtividade}
                                        numberOfLines={1}
                                    >
                                        {item.titulo}
                                    </Text>

                                    <Text style={styles.categoriaAtividade}>
                                        {item.categoria}
                                    </Text>

                                    <Text style={styles.dataAtividade}>
                                        {item.data}
                                        {item.horario
                                            ? ` • ${item.horario}`
                                            : ''}
                                    </Text>

                                    {item.descricao ? (
                                        <Text
                                            style={styles.descricaoAtividade}
                                            numberOfLines={2}
                                        >
                                            {item.descricao}
                                        </Text>
                                    ) : null}
                                </View>

                                {/* Três pontinhos */}
                                <Pressable
                                    style={styles.botaoMais}
                                    onPress={() => abrirOpcoes(item)}
                                    hitSlop={10}
                                >
                                    <Text style={styles.mais}>
                                        •••
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}

                {/* Decoração */}
                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>
                        ☁️
                    </Text>

                    <Text style={styles.coracao}>
                        ♥
                    </Text>

                    <Text style={styles.decoracaoEmoji}>
                        🌈
                    </Text>
                </View>
            </ScrollView>

            {/* Botão + */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() => router.push('/nova-atividade')}
            >
                <Text style={styles.maisAdicionar}>
                    +
                </Text>
            </Pressable>

            {/* Menu inferior */}
            <View style={styles.menuInferior}>
                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.replace('/home')}
                >
                    <Text style={styles.menuIcone}>
                        ⌂
                    </Text>

                    <Text style={styles.menuTexto}>
                        Início
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/agenda')}
                >
                    <Text style={styles.menuIcone}>
                        ▣
                    </Text>

                    <Text style={styles.menuTexto}>
                        Agenda
                    </Text>
                </Pressable>

                <Pressable style={styles.itemMenu}>
                    <Text style={styles.menuIconeAtivo}>
                        ✎
                    </Text>

                    <Text style={styles.menuTextoAtivo}>
                        Atividades
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/orientacoes')}
                >
                    <Text style={styles.menuIcone}>
                        ♧
                    </Text>

                    <Text style={styles.menuTexto}>
                        Orientações
                    </Text>
                </Pressable>
            </View>
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
        paddingBottom: 125,
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

    titulo: {
        color: '#40515A',
        fontSize: 20,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 31,
    },

    introducao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 18,
        marginBottom: 22,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 18,
        fontWeight: '700',
    },

    subtitulo: {
        color: '#7D898E',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 5,
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
        marginBottom: 20,
    },

    cardCategoria: {
        width: '31%',
        height: 95,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    azul: {
        backgroundColor: '#DDF3FA',
        borderWidth: 1,
        borderColor: '#C6E8F2',
    },

    verde: {
        backgroundColor: '#DDF1D6',
    },

    amarelo: {
        backgroundColor: '#FFF1C9',
    },

    roxo: {
        backgroundColor: '#E8DDF5',
    },

    rosa: {
        backgroundColor: '#F8DDE6',
    },

    azulClaro: {
        backgroundColor: '#E7F6FA',
    },

    emoji: {
        fontSize: 27,
        marginBottom: 6,
    },

    nomeCategoria: {
        color: '#566268',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },

    tituloRegistros: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    quantidade: {
        color: '#42A5D5',
        fontSize: 11,
        marginBottom: 12,
    },

    semAtividades: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 27,
        paddingHorizontal: 15,
        alignItems: 'center',
    },

    iconeVazio: {
        fontSize: 34,
        marginBottom: 9,
    },

    textoVazio: {
        color: '#4D5A60',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },

    subtextoVazio: {
        color: '#929DA2',
        fontSize: 11,
        marginTop: 5,
        textAlign: 'center',
    },

    listaAtividades: {
        gap: 10,
    },

    cardAtividade: {
        minHeight: 105,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconeAtividade: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    emojiAtividade: {
        fontSize: 25,
    },

    informacoesAtividade: {
        flex: 1,
        paddingRight: 5,
    },

    tituloAtividade: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    categoriaAtividade: {
        color: '#42A5D5',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },

    dataAtividade: {
        color: '#89969B',
        fontSize: 10,
        marginTop: 3,
    },

    descricaoAtividade: {
        color: '#69767B',
        fontSize: 10,
        lineHeight: 14,
        marginTop: 5,
    },

    botaoMais: {
        width: 34,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    mais: {
        color: '#A4AFB3',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 1,
    },

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20,
    },

    decoracaoEmoji: {
        fontSize: 32,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },

    botaoAdicionar: {
        position: 'absolute',
        right: 22,
        bottom: 102,
        width: 57,
        height: 57,
        borderRadius: 29,
        backgroundColor: '#FF7FA3',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 7,
        zIndex: 10,
    },

    maisAdicionar: {
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: '300',
        marginTop: -3,
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
});