import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from 'firebase/firestore';

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
import { auth, db } from '../../config/firebase';

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
    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState<string | null>(null);

    const atividadesFiltradas = categoriaSelecionada
        ? atividades.filter(
            (atividade) =>
                atividade.categoria === categoriaSelecionada
        )
        : atividades;
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
            const usuario = auth.currentUser;

            if (!usuario) {
                setAtividades([]);
                return;
            }

            const referencia = collection(
                db,
                'usuarios',
                usuario.uid,
                'atividades'
            );

            const resultado = await getDocs(referencia);

            const lista: Atividade[] = resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<Atividade, 'id'>),
                })
            );

            setAtividades(lista.reverse());

        } catch (erro) {
            console.log(
                'Erro ao carregar atividades:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar as atividades.'
            );
        }
    }

    function pegarIconeCategoria(categoria: string) {
        switch (categoria) {
            case 'Comunicação':
                return 'chatbubble-ellipses-outline';

            case 'Alimentação':
                return 'restaurant-outline';

            case 'Escola':
                return 'school-outline';

            case 'Sensorial':
                return 'options-outline';

            case 'Rotina':
                return 'repeat-outline';

            default:
                return 'ellipsis-horizontal';
        }
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
            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada.'
                );
                return;
            }

            await deleteDoc(
                doc(
                    db,
                    'usuarios',
                    usuario.uid,
                    'atividades',
                    id
                )
            );

            setAtividades((listaAtual) =>
                listaAtual.filter(
                    (atividade) => atividade.id !== id
                )
            );

            Alert.alert(
                'Atividade excluída',
                'A atividade foi removida com sucesso.'
            );

        } catch (erro) {
            console.log(
                'Erro ao excluir atividade:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível excluir a atividade.'
            );
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View
                pointerEvents="none"
                style={styles.decoracaoFundo}
            >
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
                        onPress={() => router.replace('/home')}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.titulo}>
                        Atividades
                    </Text>


                </View>

                {/* Introdução */}
                <View style={styles.introducao}>
                    <View>
                        <Text style={styles.tituloIntroducao}>
                            Acompanhe o dia a dia
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
                    <Pressable
                        style={[
                            styles.cardCategoria,
                            styles.cardCategoriaAzul,
                            categoriaSelecionada === 'Comunicação' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Comunicação'
                                    ? null
                                    : 'Comunicação'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaAzul,
                                categoriaSelecionada === 'Comunicação' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Comunicação'
                                        ? '#FFFFFF'
                                        : '#42A5D5'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Comunicação
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.cardCategoria,
                            styles.cardCategoriaRosa,
                            categoriaSelecionada === 'Alimentação' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Alimentação'
                                    ? null
                                    : 'Alimentação'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaRosa,
                                categoriaSelecionada === 'Alimentação' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="restaurant-outline"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Alimentação'
                                        ? '#FFFFFF'
                                        : '#FF7FA3'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Alimentação
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.cardCategoria,
                            categoriaSelecionada === 'Escola' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Escola'
                                    ? null
                                    : 'Escola'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaAzul,
                                categoriaSelecionada === 'Escola' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="school-outline"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Escola'
                                        ? '#FFFFFF'
                                        : '#42A5D5'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Escola
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.cardCategoria,
                            styles.cardCategoriaRosa,
                            categoriaSelecionada === 'Sensorial' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Sensorial'
                                    ? null
                                    : 'Sensorial'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaRosa,
                                categoriaSelecionada === 'Sensorial' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="options-outline"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Sensorial'
                                        ? '#FFFFFF'
                                        : '#FF7FA3'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Sensorial
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.cardCategoria,
                            categoriaSelecionada === 'Rotina' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Rotina'
                                    ? null
                                    : 'Rotina'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaAzul,
                                categoriaSelecionada === 'Rotina' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="repeat-outline"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Rotina'
                                        ? '#FFFFFF'
                                        : '#42A5D5'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Rotina
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.cardCategoria,
                            styles.cardCategoriaRosa,
                            categoriaSelecionada === 'Outros' &&
                            styles.cardCategoriaSelecionado,
                        ]}
                        onPress={() =>
                            setCategoriaSelecionada(
                                categoriaSelecionada === 'Outros'
                                    ? null
                                    : 'Outros'
                            )
                        }
                    >
                        <View
                            style={[
                                styles.iconeCategoria,
                                styles.iconeCategoriaRosa,
                                categoriaSelecionada === 'Outros' &&
                                styles.iconeCategoriaSelecionado,
                            ]}
                        >
                            <Ionicons
                                name="ellipsis-horizontal"
                                size={24}
                                color={
                                    categoriaSelecionada === 'Outros'
                                        ? '#FFFFFF'
                                        : '#FF7FA3'
                                }
                            />
                        </View>

                        <Text style={styles.nomeCategoria}>
                            Outros
                        </Text>
                    </Pressable>
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
                        <View style={styles.iconeVazio}>
                            <Ionicons
                                name="clipboard-outline"
                                size={28}
                                color="#42A5D5"
                            />
                        </View>

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
                        {atividadesFiltradas.map((item) => (
                            <View
                                key={item.id}
                                style={styles.cardAtividade}
                            >
                                <View style={styles.iconeAtividade}>
                                    <Ionicons
                                        name={pegarIconeCategoria(item.categoria) as any}
                                        size={23}
                                        color="#42A5D5"
                                    />
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
                    <Ionicons
                        name="home-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Início
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/agenda')}
                >
                    <Ionicons
                        name="calendar-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Agenda
                    </Text>
                </Pressable>

                <Pressable style={styles.itemMenu}>
                    <Ionicons
                        name="clipboard"
                        size={22}
                        color="#42A5D5"
                    />
                    <Text style={styles.menuTextoAtivo}>
                        Atividades
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/orientacoes')}
                >
                    <Ionicons
                        name="book-outline"
                        size={22}
                        color="#8B979C"
                    />
                    <Text style={styles.menuTexto}>
                        Orientações
                    </Text>
                </Pressable>

            </View>



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
        gap: 10,
    },

    cardCategoria: {
        width: '30%',
        height: 105,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
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
        width: 52,
        height: 52,
        borderRadius: 17,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
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
    cardCategoriaSelecionado: {
        backgroundColor: '#FFF0F5',
        borderColor: '#FF7FA3',
    },

    iconeCategoria: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconeCategoriaAzul: {
        backgroundColor: '#EAF7FC',
    },

    iconeCategoriaRosa: {
        backgroundColor: '#FFF0F5',
    },

    iconeCategoriaSelecionado: {
        backgroundColor: '#FF7FA3',
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
    cardCategoriaAzul: {
        backgroundColor: '#EDF8FC',
    },

    cardCategoriaRosa: {
        backgroundColor: '#FFF0F5',
    },
});