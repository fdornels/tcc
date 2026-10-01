import {
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const categorias = [
    { nome: 'Comunicação', icone: '💬' },
    { nome: 'Alimentação', icone: '🍎' },
    { nome: 'Escola', icone: '🎒' },
    { nome: 'Sensorial', icone: '🧩' },
    { nome: 'Rotina', icone: '🌈' },
    { nome: 'Outros', icone: '⭐' },
];

type Atividade = {
    id: string;
    titulo: string;
    categoria: string;
    data: string;
    horario: string;
    descricao: string;
    observacoes: string;
};

export default function NovaAtividadeScreen() {
    const parametros = useLocalSearchParams();

    const idParametro = Array.isArray(parametros.id)
        ? parametros.id[0]
        : parametros.id;

    const modoEdicao = Boolean(idParametro);

    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const [descricao, setDescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        if (idParametro) {
            carregarAtividade(idParametro);
        }
    }, [idParametro]);

    async function carregarAtividade(id: string) {
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada.'
                );
                return;
            }

            const referencia = doc(
                db,
                'usuarios',
                usuario.uid,
                'atividades',
                id
            );

            const documento = await getDoc(referencia);

            if (!documento.exists()) {
                Alert.alert(
                    'Erro',
                    'Não foi possível encontrar a atividade.'
                );
                return;
            }

            const atividade =
                documento.data() as Omit<Atividade, 'id'>;

            setTitulo(atividade.titulo ?? '');
            setCategoria(atividade.categoria ?? '');
            setData(atividade.data ?? '');
            setHorario(atividade.horario ?? '');
            setDescricao(atividade.descricao ?? '');
            setObservacoes(atividade.observacoes ?? '');

        } catch (erro) {
            console.log(
                'Erro ao carregar atividade:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar a atividade.'
            );
        }
    }

    function formatarData(texto: string) {
        const numeros = texto.replace(/\D/g, '').slice(0, 8);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 4) {
            return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
        }

        return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    }
    function dataValida(valor: string) {
        const partes = valor.split('/');

        if (partes.length !== 3) {
            return false;
        }

        const dia = Number(partes[0]);
        const mes = Number(partes[1]);
        const ano = Number(partes[2]);

        const anoAtual = new Date().getFullYear();

        if (
            dia < 1 ||
            mes < 1 ||
            mes > 12 ||
            ano < anoAtual
        ) {
            return false;
        }

        const dataCriada = new Date(
            ano,
            mes - 1,
            dia
        );

        return (
            dataCriada.getFullYear() === ano &&
            dataCriada.getMonth() === mes - 1 &&
            dataCriada.getDate() === dia
        );
    }
    function formatarHorario(texto: string) {
        const numeros = texto.replace(/\D/g, '').slice(0, 4);

        if (numeros.length <= 2) {
            return numeros;
        }

        return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
    }
    function horarioValido(valor: string) {
        const partes = valor.split(':');

        if (partes.length !== 2) {
            return false;
        }

        const hora = Number(partes[0]);
        const minuto = Number(partes[1]);

        if (
            partes[0].length !== 2 ||
            partes[1].length !== 2
        ) {
            return false;
        }

        return (
            hora >= 0 &&
            hora <= 23 &&
            minuto >= 0 &&
            minuto <= 59
        );
    }
    async function salvarAtividade() {
        if (
            !titulo.trim() ||
            !categoria.trim() ||
            !data.trim() ||
            !descricao.trim()
        ) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha o título, a categoria, a data e a descrição.'
            );
            return;
        }
        if (!dataValida(data)) {
            Alert.alert(
                'Data inválida',
                'Verifique o dia, o mês e o ano informados.'
            );
            return;
        }
        if (horario.trim() && !horarioValido(horario)) {
            Alert.alert(
                'Horário inválido',
                'Digite um horário válido entre 00:00 e 23:59.'
            );
            return;
        }
        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada.'
                );
                return;
            }

            const dadosAtividade = {
                titulo: titulo.trim(),
                categoria: categoria.trim(),
                data: data.trim(),
                horario: horario.trim(),
                descricao: descricao.trim(),
                observacoes: observacoes.trim(),
            };

            // EDITAR
            if (modoEdicao && idParametro) {
                await setDoc(
                    doc(
                        db,
                        'usuarios',
                        usuario.uid,
                        'atividades',
                        idParametro
                    ),
                    dadosAtividade
                );

                Alert.alert(
                    'Alterações salvas! 💙',
                    'A atividade foi atualizada com sucesso.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                router.replace('/atividades'),
                        },
                    ]
                );

                return;
            }

            // CADASTRAR
            const novoId = Date.now().toString();

            await setDoc(
                doc(
                    db,
                    'usuarios',
                    usuario.uid,
                    'atividades',
                    novoId
                ),
                dadosAtividade
            );

            Alert.alert(
                'Atividade salva! 💙',
                'A atividade foi registrada com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/atividades'),
                    },
                ]
            );

        } catch (erro) {
            console.log(
                'Erro ao salvar atividade:',
                erro
            );

            Alert.alert(
                'Erro',
                modoEdicao
                    ? 'Não foi possível atualizar a atividade.'
                    : 'Não foi possível salvar a atividade.'
            );
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios' ? 'padding' : undefined
                }
            >
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
                            <Text style={styles.seta}>‹</Text>
                        </Pressable>

                        <Text style={styles.tituloPagina}>
                            {modoEdicao
                                ? 'Editar atividade'
                                : 'Nova atividade'}
                        </Text>

                        <Text style={styles.estrela}>★</Text>
                    </View>

                    {/* Introdução */}
                    <View style={styles.introducao}>
                        <Text style={styles.iconeIntroducao}>
                            ✏️
                        </Text>

                        <View style={styles.textoIntroducao}>
                            <Text style={styles.tituloIntroducao}>
                                {modoEdicao
                                    ? 'Editar atividade'
                                    : 'Registrar atividade'}
                            </Text>

                            <Text style={styles.subtituloIntroducao}>
                                {modoEdicao
                                    ? 'Atualize as informações desta atividade.'
                                    : 'Registre momentos e atividades importantes do dia a dia.'}
                            </Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.card}>
                        <Text style={styles.label}>
                            Título da atividade *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Brincadeira com massinha"
                            placeholderTextColor="#A1AAAE"
                            value={titulo}
                            onChangeText={setTitulo}
                        />

                        <Text style={styles.label}>
                            Categoria *
                        </Text>

                        <View style={styles.gradeCategorias}>
                            {categorias.map((item) => {
                                const selecionada =
                                    categoria === item.nome;

                                return (
                                    <Pressable
                                        key={item.nome}
                                        style={[
                                            styles.categoria,
                                            selecionada &&
                                            styles.categoriaSelecionada,
                                        ]}
                                        onPress={() =>
                                            setCategoria(item.nome)
                                        }
                                    >
                                        <Text
                                            style={styles.iconeCategoria}
                                        >
                                            {item.icone}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.textoCategoria,
                                                selecionada &&
                                                styles.textoCategoriaSelecionada,
                                            ]}
                                        >
                                            {item.nome}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Data e horário */}
                        <View style={styles.linha}>
                            <View style={styles.campoMetade}>
                                <Text style={styles.label}>
                                    Data *
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor="#A1AAAE"
                                    value={data}
                                    onChangeText={(texto) => {
                                        setData(formatarData(texto));
                                    }}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>

                            <View style={styles.espaco} />

                            <View style={styles.campoMetade}>
                                <Text style={styles.label}>
                                    Horário
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="HH:MM"
                                    placeholderTextColor="#A1AAAE"
                                    value={horario}
                                    onChangeText={(texto) => {
                                        setHorario(formatarHorario(texto));
                                    }}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                        </View>

                        {/* Descrição */}
                        <Text style={styles.label}>
                            Descrição *
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputDescricao,
                            ]}
                            placeholder="Descreva o que foi realizado..."
                            placeholderTextColor="#A1AAAE"
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Observações */}
                        <Text style={styles.label}>
                            Observações
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputObservacoes,
                            ]}
                            placeholder="Alguma informação adicional..."
                            placeholderTextColor="#A1AAAE"
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={styles.aviso}>
                            * Campos obrigatórios
                        </Text>

                        <Pressable
                            style={styles.botaoSalvar}
                            onPress={salvarAtividade}
                        >
                            <Text style={styles.textoBotaoSalvar}>
                                {modoEdicao
                                    ? 'Salvar alterações'
                                    : 'Salvar atividade'}
                            </Text>
                        </Pressable>
                    </View>

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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF3FA',
    },

    flex: {
        flex: 1,
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
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 29,
    },

    introducao: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        paddingHorizontal: 5,
    },

    iconeIntroducao: {
        fontSize: 40,
        marginRight: 12,
    },

    textoIntroducao: {
        flex: 1,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 17,
        fontWeight: '700',
    },

    subtituloIntroducao: {
        color: '#77858B',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
    },

    label: {
        color: '#4D5A60',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 7,
    },

    input: {
        minHeight: 50,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        color: '#3E494F',
        fontSize: 14,
        marginBottom: 17,
    },

    gradeCategorias: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 17,
    },

    categoria: {
        width: '31%',
        minHeight: 73,
        borderRadius: 15,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        marginBottom: 8,
    },

    categoriaSelecionada: {
        backgroundColor: '#FFE1EA',
        borderColor: '#FF7FA3',
        borderWidth: 2,
    },

    iconeCategoria: {
        fontSize: 23,
        marginBottom: 4,
    },

    textoCategoria: {
        color: '#667277',
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },

    textoCategoriaSelecionada: {
        color: '#E75E87',
        fontWeight: '700',
    },

    linha: {
        flexDirection: 'row',
    },

    campoMetade: {
        flex: 1,
    },

    espaco: {
        width: 12,
    },

    inputDescricao: {
        height: 95,
        paddingTop: 13,
    },

    inputObservacoes: {
        height: 80,
        paddingTop: 13,
    },

    aviso: {
        color: '#98A1A5',
        fontSize: 10,
        marginTop: -6,
        marginBottom: 17,
    },

    botaoSalvar: {
        height: 53,
        borderRadius: 16,
        backgroundColor: '#FF7FA3',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotaoSalvar: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 18,
    },

    decoracaoEmoji: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
});