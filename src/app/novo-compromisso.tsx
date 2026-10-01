import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

type Compromisso = {
    id: string;
    titulo: string;
    tipo: string;
    data: string;
    horario: string;
    local: string;
    observacoes: string;
};

export default function NovoCompromissoScreen() {
    const parametros = useLocalSearchParams();

    const idParametro = Array.isArray(parametros.id)
        ? parametros.id[0]
        : parametros.id;

    const modoEdicao = Boolean(idParametro);

    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const [local, setLocal] = useState('');
    const [observacoes, setObservacoes] = useState('');

    // Quando a tela abrir para edição,
    // busca o compromisso existente.
    useEffect(() => {
        if (idParametro) {
            carregarCompromisso(idParametro);
        }
    }, [idParametro]);

    async function carregarCompromisso(id: string) {
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
                'compromissos',
                id
            );

            const documento = await getDoc(referencia);

            if (!documento.exists()) {
                Alert.alert(
                    'Erro',
                    'Não foi possível encontrar o compromisso.'
                );
                return;
            }

            const compromisso =
                documento.data() as Omit<Compromisso, 'id'>;

            setTitulo(compromisso.titulo ?? '');
            setTipo(compromisso.tipo ?? '');
            setData(compromisso.data ?? '');
            setHorario(compromisso.horario ?? '');
            setLocal(compromisso.local ?? '');
            setObservacoes(compromisso.observacoes ?? '');

        } catch (erro) {
            console.log(
                'Erro ao carregar compromisso:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível carregar o compromisso.'
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
    async function salvarCompromisso() {
        if (!titulo.trim() || !data.trim() || !horario.trim()) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha o título, a data e o horário.'
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
        if (!horarioValido(horario)) {
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

            const dadosCompromisso = {
                titulo: titulo.trim(),
                tipo: tipo.trim(),
                data: data.trim(),
                horario: horario.trim(),
                local: local.trim(),
                observacoes: observacoes.trim(),
            };

            // EDITAR COMPROMISSO EXISTENTE
            if (modoEdicao && idParametro) {
                await setDoc(
                    doc(
                        db,
                        'usuarios',
                        usuario.uid,
                        'compromissos',
                        idParametro
                    ),
                    dadosCompromisso
                );

                Alert.alert(
                    'Alterações salvas! 💙',
                    'O compromisso foi atualizado.',
                    [
                        {
                            text: 'OK',
                            onPress: () =>
                                router.replace('/agenda'),
                        },
                    ]
                );

                return;
            }

            // CADASTRAR NOVO COMPROMISSO
            const novoId = Date.now().toString();

            await setDoc(
                doc(
                    db,
                    'usuarios',
                    usuario.uid,
                    'compromissos',
                    novoId
                ),
                dadosCompromisso
            );

            Alert.alert(
                'Compromisso salvo! 💙',
                'Seu compromisso foi adicionado à agenda.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/agenda'),
                    },
                ]
            );

        } catch (erro) {
            console.log(
                'Erro ao salvar compromisso:',
                erro
            );

            Alert.alert(
                'Erro',
                modoEdicao
                    ? 'Não foi possível atualizar o compromisso.'
                    : 'Não foi possível salvar o compromisso.'
            );
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                                ? 'Editar compromisso'
                                : 'Novo compromisso'}
                        </Text>

                        <Text style={styles.estrela}>★</Text>
                    </View>

                    {/* Introdução */}
                    <View style={styles.introducao}>
                        <Text style={styles.iconeCalendario}>🗓️</Text>

                        <View style={styles.textoIntroducao}>
                            <Text style={styles.tituloIntroducao}>
                                {modoEdicao
                                    ? 'Editar compromisso'
                                    : 'Adicionar à agenda'}
                            </Text>

                            <Text style={styles.subtituloIntroducao}>
                                {modoEdicao
                                    ? 'Atualize as informações do compromisso.'
                                    : 'Organize consultas, terapias e outros compromissos.'}
                            </Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Título *</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Terapia Ocupacional"
                            placeholderTextColor="#A1AAAE"
                            value={titulo}
                            onChangeText={setTitulo}
                        />

                        <Text style={styles.label}>
                            Tipo de compromisso
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Consulta, terapia, escola..."
                            placeholderTextColor="#A1AAAE"
                            value={tipo}
                            onChangeText={setTipo}
                        />

                        <View style={styles.linha}>
                            <View style={styles.campoMetade}>
                                <Text style={styles.label}>Data *</Text>

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
                                <Text style={styles.label}>Horário *</Text>

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

                        <Text style={styles.label}>
                            Local ou profissional
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Clínica Vida"
                            placeholderTextColor="#A1AAAE"
                            value={local}
                            onChangeText={setLocal}
                        />

                        <Text style={styles.label}>
                            Observações
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputObservacoes,
                            ]}
                            placeholder="Adicione alguma informação importante..."
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
                            onPress={salvarCompromisso}
                        >
                            <Text style={styles.textoBotaoSalvar}>
                                {modoEdicao
                                    ? 'Salvar alterações'
                                    : 'Salvar compromisso'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Decoração */}
                    <View style={styles.decoracao}>
                        <Text style={styles.nuvem}>☁️</Text>
                        <Text style={styles.coracao}>♥</Text>
                        <Text style={styles.arcoIris}>🌈</Text>
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

    iconeCalendario: {
        fontSize: 42,
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

    linha: {
        flexDirection: 'row',
    },

    campoMetade: {
        flex: 1,
    },

    espaco: {
        width: 12,
    },

    inputObservacoes: {
        height: 95,
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

    nuvem: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },

    arcoIris: {
        fontSize: 35,
    },
});