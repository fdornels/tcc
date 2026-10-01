import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../../config/firebase';

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

type Crianca = {
    nome: string;
    apelido: string;
    dataNascimento: string;
    sexo: 'Menina' | 'Menino' | 'Prefiro não identificar';
    escola: string;
    comunicacao: string;
    preferencias: string;
    sensibilidades: string;
    observacoes: string;
};

export default function CadastrarCriancaScreen() {
    const [nome, setNome] = useState('');
    const [apelido, setApelido] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [sexo, setSexo] = useState<
        'Menina' | 'Menino' | 'Prefiro não identificar'
    >('Prefiro não identificar');
    const [escola, setEscola] = useState('');
    const [comunicacao, setComunicacao] = useState('');
    const [preferencias, setPreferencias] = useState('');
    const [sensibilidades, setSensibilidades] = useState('');
    const [observacoes, setObservacoes] = useState('');

    function formatarData(texto: string) {
        const numeros = texto.replace(/\D/g, '').slice(0, 8);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 4) {
            return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
        }

        return `${numeros.slice(0, 2)}/${numeros.slice(
            2,
            4
        )}/${numeros.slice(4)}`;
    }

    async function salvarCrianca() {
        if (!nome.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Informe o nome da criança.'
            );
            return;
        }

        if (!dataNascimento.trim()) {
            Alert.alert(
                'Campo obrigatório',
                'Informe a data de nascimento.'
            );
            return;
        }

        if (dataNascimento.length !== 10) {
            Alert.alert(
                'Data inválida',
                'Informe a data no formato DD/MM/AAAA.'
            );
            return;
        }

        const crianca: Crianca = {
            nome: nome.trim(),
            apelido: apelido.trim(),
            dataNascimento: dataNascimento.trim(),
            sexo,
            escola: escola.trim(),
            comunicacao: comunicacao.trim(),
            preferencias: preferencias.trim(),
            sensibilidades: sensibilidades.trim(),
            observacoes: observacoes.trim(),
        };

        try {
            const usuario = auth.currentUser;

            if (!usuario) {
                Alert.alert(
                    'Erro',
                    'Você precisa estar conectada para cadastrar a criança.'
                );
                return;
            }

            await setDoc(
                doc(
                    db,
                    'usuarios',
                    usuario.uid,
                    'crianca',
                    'dados'
                ),
                crianca
            );

            Alert.alert(
                'Cadastro realizado! 💙',
                'As informações da criança foram salvas com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/minha-crianca'),
                    },
                ]
            );
        } catch (erro) {
            console.log('Erro ao salvar criança:', erro);

            Alert.alert(
                'Erro',
                'Não foi possível salvar as informações.'
            );
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
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
                            Cadastrar criança
                        </Text>

                        <Text style={styles.estrela}>★</Text>
                    </View>

                    {/* APRESENTAÇÃO */}
                    <View style={styles.apresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Text style={styles.emojiApresentacao}>
                                👧🏻
                            </Text>
                        </View>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Informações da criança
                            </Text>

                            <Text style={styles.subtituloApresentacao}>
                                Registre informações importantes para
                                facilitar o acompanhamento no dia a dia.
                            </Text>
                        </View>
                    </View>

                    {/* DADOS BÁSICOS */}
                    <Text style={styles.tituloSecao}>
                        Dados básicos
                    </Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>Nome *</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Ana Beatriz"
                            placeholderTextColor="#A1AAAE"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <Text style={styles.label}>
                            Como gosta de ser chamada
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Bia"
                            placeholderTextColor="#A1AAAE"
                            value={apelido}
                            onChangeText={setApelido}
                        />

                        <Text style={styles.label}>
                            Data de nascimento *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#A1AAAE"
                            value={dataNascimento}
                            onChangeText={(texto) =>
                                setDataNascimento(formatarData(texto))
                            }
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        <Text style={styles.label}>
                            Identificação
                        </Text>

                        <View style={styles.opcoesSexo}>
                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Menina' && styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Menina')}
                            >
                                <Text style={styles.emojiSexo}>👧</Text>
                                <Text style={styles.textoSexo}>Menina</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Menino' && styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Menino')}
                            >
                                <Text style={styles.emojiSexo}>👦</Text>
                                <Text style={styles.textoSexo}>Menino</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.opcaoSexo,
                                    sexo === 'Prefiro não identificar' &&
                                    styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo('Prefiro não identificar')}
                            >
                                <Text style={styles.emojiSexo}>👶</Text>
                                <Text style={styles.textoSexo}>
                                    Prefiro não identificar
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={styles.label}>Escola</Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputUltimo,
                            ]}
                            placeholder="Ex.: Escola Caminhos"
                            placeholderTextColor="#A1AAAE"
                            value={escola}
                            onChangeText={setEscola}
                        />
                    </View>

                    {/* COMUNICAÇÃO */}
                    <Text style={styles.tituloSecao}>
                        Comunicação
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Text style={styles.emojiCampo}>💬</Text>

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Como a criança se comunica?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Você pode registrar fala, gestos,
                                    comunicação alternativa ou outras formas.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Descreva aqui..."
                            placeholderTextColor="#A1AAAE"
                            value={comunicacao}
                            onChangeText={setComunicacao}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* PREFERÊNCIAS */}
                    <Text style={styles.tituloSecao}>
                        Preferências e interesses
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Text style={styles.emojiCampo}>💗</Text>

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Do que ela gosta?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Brinquedos, alimentos, personagens,
                                    atividades, assuntos ou formas de conforto.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Ex.: gosta de música, desenhos e blocos..."
                            placeholderTextColor="#A1AAAE"
                            value={preferencias}
                            onChangeText={setPreferencias}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* SENSIBILIDADES */}
                    <Text style={styles.tituloSecao}>
                        Sensibilidades
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Text style={styles.emojiCampo}>🧩</Text>

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    O que merece atenção?
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Registre estímulos ou situações que podem
                                    causar desconforto.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Ex.: sons muito altos, ambientes cheios..."
                            placeholderTextColor="#A1AAAE"
                            value={sensibilidades}
                            onChangeText={setSensibilidades}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* OBSERVAÇÕES */}
                    <Text style={styles.tituloSecao}>
                        Outras informações
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.cabecalhoCampo}>
                            <Text style={styles.emojiCampo}>⭐</Text>

                            <View style={styles.textoCampo}>
                                <Text style={styles.labelSemMargem}>
                                    Observações importantes
                                </Text>

                                <Text style={styles.ajudaCampo}>
                                    Acrescente outras informações que possam
                                    ajudar no acompanhamento.
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.areaTexto}
                            placeholder="Adicione alguma informação importante..."
                            placeholderTextColor="#A1AAAE"
                            value={observacoes}
                            onChangeText={setObservacoes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <Text style={styles.camposObrigatorios}>
                        * Campos obrigatórios
                    </Text>

                    <Pressable
                        style={styles.botaoSalvar}
                        onPress={salvarCrianca}
                    >
                        <Text style={styles.textoBotaoSalvar}>
                            Salvar informações
                        </Text>
                    </Pressable>

                    <View style={styles.decoracao}>
                        <Text style={styles.decoracaoEmoji}>🧩</Text>
                        <Text style={styles.coracao}>♥</Text>
                        <Text style={styles.decoracaoEmoji}>🌈</Text>
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
        marginBottom: 20,
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

    apresentacao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        marginBottom: 22,
    },

    iconeApresentacao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#E8F7FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiApresentacao: {
        fontSize: 31,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    subtituloApresentacao: {
        color: '#829096',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 9,
        marginLeft: 2,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        marginBottom: 20,
    },

    label: {
        color: '#4D5A60',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 7,
    },

    labelSemMargem: {
        color: '#4D5A60',
        fontSize: 12,
        fontWeight: '700',
    },

    input: {
        height: 49,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        color: '#3E494F',
        fontSize: 12,
        marginBottom: 15,
    },

    inputUltimo: {
        marginBottom: 0,
    },

    cabecalhoCampo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },

    emojiCampo: {
        fontSize: 25,
        marginRight: 10,
    },

    textoCampo: {
        flex: 1,
    },

    ajudaCampo: {
        color: '#8A969B',
        fontSize: 9,
        lineHeight: 13,
        marginTop: 3,
    },

    areaTexto: {
        minHeight: 90,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        color: '#3E494F',
        fontSize: 12,
    },

    camposObrigatorios: {
        color: '#8B979C',
        fontSize: 9,
        marginBottom: 10,
        marginLeft: 3,
    },

    botaoSalvar: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#FF7FA3',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotaoSalvar: {
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
    opcoesSexo: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 15,
    },

    opcaoSexo: {
        flex: 1,
        minHeight: 72,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        paddingVertical: 8,
    },

    opcaoSexoSelecionada: {
        backgroundColor: '#E8F7FB',
        borderColor: '#4288AF',
        borderWidth: 2,
    },

    emojiSexo: {
        fontSize: 24,
        marginBottom: 4,
    },

    textoSexo: {
        color: '#4D5A60',
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
});