import { router, useFocusEffect } from 'expo-router';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
} from 'firebase/firestore';
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

type Compromisso = {
    id: string;
    titulo: string;
    tipo: string;
    data: string;
    horario: string;
    local: string;
    observacoes: string;
};

const dias = [
    { numero: 27, outroMes: true },
    { numero: 28, outroMes: true },
    { numero: 29, outroMes: true },
    { numero: 30, outroMes: true },
    { numero: 1 },
    { numero: 2 },
    { numero: 3 },

    { numero: 4 },
    { numero: 5 },
    { numero: 6 },
    { numero: 7 },
    { numero: 8 },
    { numero: 9 },
    { numero: 10 },

    { numero: 11 },
    { numero: 12 },
    { numero: 13, selecionado: true },
    { numero: 14 },
    { numero: 15 },
    { numero: 16 },
    { numero: 17 },

    { numero: 18 },
    { numero: 19 },
    { numero: 20 },
    { numero: 21 },
    { numero: 22 },
    { numero: 23 },
    { numero: 24 },

    { numero: 25 },
    { numero: 26 },
    { numero: 27 },
    { numero: 28 },
    { numero: 29 },
    { numero: 30 },
    { numero: 31 },
];

export default function AgendaScreen() {
    const [compromissos, setCompromissos] = useState<Compromisso[]>([]);

    // Busca os compromissos salvos no celular
    async function carregarCompromissos() {
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                setCompromissos([]);
                return;
            }

            const referencia = collection(
                db,
                'usuarios',
                usuario.uid,
                'compromissos'
            );

            const resultado = await getDocs(referencia);

            const lista: Compromisso[] = resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<Compromisso, 'id'>),
                })
            );

            setCompromissos(lista);

        } catch (erro) {
            console.log(
                'Erro ao carregar compromissos:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar os compromissos.'
            );
        }
    }

    // Recarrega os compromissos sempre que a Agenda for aberta
    useFocusEffect(
        useCallback(() => {
            carregarCompromissos();
        }, [])
    );

    // Escolhe um ícone de acordo com o tipo
    function escolherIcone(tipo: string) {
        const tipoMinusculo = tipo.toLowerCase();

        if (tipoMinusculo.includes('terapia')) {
            return '🧩';
        }

        if (tipoMinusculo.includes('consulta')) {
            return '🩺';
        }

        if (tipoMinusculo.includes('escola')) {
            return '🎒';
        }

        if (tipoMinusculo.includes('fono')) {
            return '🎵';
        }

        return '📅';
    }

    // Exclui o compromisso do armazenamento
    async function excluirCompromisso(id: string) {
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
                    'compromissos',
                    id
                )
            );

            setCompromissos((listaAtual) =>
                listaAtual.filter(
                    (compromisso) => compromisso.id !== id
                )
            );

        } catch (erro) {
            console.log(
                'Erro ao excluir compromisso:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível excluir o compromisso.'
            );
        }
    }

    // Confirma antes de excluir
    function confirmarExclusao(item: Compromisso) {
        Alert.alert(
            'Excluir compromisso',
            `Deseja realmente excluir "${item.titulo}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => excluirCompromisso(item.id),
                },
            ]
        );
    }

    // Abre as opções dos três pontinhos
    function abrirOpcoes(item: Compromisso) {
        Alert.alert(
            item.titulo,
            'O que você deseja fazer?',
            [
                {
                    text: 'Editar',
                    onPress: () => {
                        router.push({
                            pathname: '/novo-compromisso',
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

                    <Text style={styles.titulo}>Agenda</Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Calendário */}
                <View style={styles.calendario}>
                    <View style={styles.mesArea}>
                        <Text style={styles.setaMes}>‹</Text>

                        <Text style={styles.mes}>
                            Maio 2026
                        </Text>

                        <Text style={styles.setaMes}>›</Text>
                    </View>

                    {/* Dias da semana */}
                    <View style={styles.diasSemana}>
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(
                            (dia, index) => (
                                <Text
                                    key={index}
                                    style={styles.diaSemana}
                                >
                                    {dia}
                                </Text>
                            )
                        )}
                    </View>

                    {/* Dias do calendário */}
                    <View style={styles.gradeCalendario}>
                        {dias.map((dia, index) => (
                            <View
                                key={index}
                                style={styles.diaContainer}
                            >
                                <View
                                    style={[
                                        styles.dia,
                                        dia.selecionado &&
                                        styles.diaSelecionado,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.numeroDia,
                                            dia.outroMes &&
                                            styles.outroMes,
                                            dia.selecionado &&
                                            styles.numeroSelecionado,
                                        ]}
                                    >
                                        {dia.numero}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.decoracaoCalendario}>
                        <Text>☁️</Text>
                        <Text style={styles.coracao}>♥</Text>
                    </View>
                </View>

                {/* Título da lista */}
                <Text style={styles.tituloSecao}>
                    Próximos compromissos
                </Text>

                {/* Caso não exista nenhum compromisso */}
                {compromissos.length === 0 ? (
                    <View style={styles.semCompromissos}>
                        <Text style={styles.iconeVazio}>
                            🗓️
                        </Text>

                        <Text style={styles.textoVazio}>
                            Nenhum compromisso cadastrado.
                        </Text>

                        <Text style={styles.subtextoVazio}>
                            Toque no botão + para adicionar.
                        </Text>
                    </View>
                ) : (
                    /* Lista dos compromissos cadastrados */
                    compromissos.map((item) => (
                        <View
                            key={item.id}
                            style={styles.compromisso}
                        >
                            <View style={styles.iconeCompromisso}>
                                <Text style={styles.emojiCompromisso}>
                                    {escolherIcone(item.tipo)}
                                </Text>
                            </View>

                            <View style={styles.infoCompromisso}>
                                <Text style={styles.nomeCompromisso}>
                                    {item.titulo}
                                </Text>

                                <Text style={styles.dataCompromisso}>
                                    {item.data} • {item.horario}
                                </Text>

                                {item.local ? (
                                    <Text style={styles.localCompromisso}>
                                        {item.local}
                                    </Text>
                                ) : null}
                            </View>

                            {/* Botão dos três pontinhos */}
                            <Pressable
                                style={styles.botaoMais}
                                onPress={() => abrirOpcoes(item)}
                            >
                                <Text style={styles.mais}>
                                    •••
                                </Text>
                            </Pressable>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Botão para adicionar compromisso */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() =>
                    router.push('/novo-compromisso')
                }
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

                <Pressable style={styles.itemMenu}>
                    <Text style={styles.menuIconeAtivo}>
                        ▣
                    </Text>

                    <Text style={styles.menuTextoAtivo}>
                        Agenda
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() =>
                        router.push('/atividades')
                    }
                >
                    <Text style={styles.menuIcone}>
                        ✎
                    </Text>

                    <Text style={styles.menuTexto}>
                        Atividades
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() =>
                        router.push('/orientacoes')
                    }
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
        marginBottom: 18,
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

    calendario: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingTop: 17,
        paddingBottom: 10,
        marginBottom: 20,
    },

    mesArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 16,
    },

    mes: {
        color: '#427DA1',
        fontSize: 16,
        fontWeight: '700',
    },

    setaMes: {
        color: '#4288AF',
        fontSize: 24,
        fontWeight: '700',
    },

    diasSemana: {
        flexDirection: 'row',
        marginBottom: 8,
    },

    diaSemana: {
        width: '14.285%',
        textAlign: 'center',
        color: '#758187',
        fontSize: 11,
        fontWeight: '700',
    },

    gradeCalendario: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    diaContainer: {
        width: '14.285%',
        alignItems: 'center',
        marginVertical: 4,
    },

    dia: {
        width: 31,
        height: 31,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    diaSelecionado: {
        backgroundColor: '#FF8FB1',
    },

    numeroDia: {
        color: '#46545B',
        fontSize: 12,
    },

    numeroSelecionado: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    outroMes: {
        color: '#C3C9CC',
    },

    decoracaoCalendario: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
        paddingHorizontal: 4,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 20,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 11,
    },

    compromisso: {
        minHeight: 76,
        backgroundColor: '#FFFFFF',
        borderRadius: 17,
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconeCompromisso: {
        width: 45,
        height: 45,
        borderRadius: 13,
        backgroundColor: '#E7F6FA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    emojiCompromisso: {
        fontSize: 22,
    },

    infoCompromisso: {
        flex: 1,
        marginLeft: 11,
    },

    nomeCompromisso: {
        color: '#465159',
        fontSize: 13,
        fontWeight: '700',
    },

    dataCompromisso: {
        color: '#899398',
        fontSize: 10,
        marginTop: 4,
    },

    localCompromisso: {
        color: '#42A5D5',
        fontSize: 10,
        marginTop: 3,
    },

    botaoMais: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    mais: {
        color: '#A5ADB0',
        fontSize: 15,
    },

    semCompromissos: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 25,
        paddingHorizontal: 15,
        alignItems: 'center',
    },

    iconeVazio: {
        fontSize: 35,
        marginBottom: 8,
    },

    textoVazio: {
        color: '#4D5A60',
        fontSize: 14,
        fontWeight: '700',
    },

    subtextoVazio: {
        color: '#929DA2',
        fontSize: 11,
        marginTop: 4,
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