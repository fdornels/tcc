import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
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

type Orientacao = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao: string;
    dicas: string[];
    lembrete: string;
};

const categorias = [
    {
        nome: 'Crise Sensorial',
        icone: '🧩',
    },
    {
        nome: 'Comunicação',
        icone: '💬',
    },
    {
        nome: 'Rotinas',
        icone: '🌈',
    },
    {
        nome: 'Direitos',
        icone: '⚖️',
    },
];

export default function NovaOrientacaoScreen() {
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [introducao, setIntroducao] = useState('');
    const [dica1, setDica1] = useState('');
    const [dica2, setDica2] = useState('');
    const [dica3, setDica3] = useState('');
    const [dica4, setDica4] = useState('');
    const [lembrete, setLembrete] = useState('');

    function pegarIconeCategoria() {
        const categoriaSelecionada = categorias.find(
            (item) => item.nome === categoria
        );

        return categoriaSelecionada?.icone ?? '📚';
    }

    async function salvarOrientacao() {
        if (
            !titulo.trim() ||
            !categoria ||
            !introducao.trim() ||
            !dica1.trim() ||
            !lembrete.trim()
        ) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha o título, a categoria, a introdução, pelo menos uma dica e o lembrete.'
            );

            return;
        }

        try {
            const dicas = [
                dica1.trim(),
                dica2.trim(),
                dica3.trim(),
                dica4.trim(),
            ].filter((dica) => dica.length > 0);

            const novaOrientacao: Orientacao = {
                id: Date.now().toString(),
                titulo: titulo.trim(),
                categoria,
                icone: pegarIconeCategoria(),
                introducao: introducao.trim(),
                dicas,
                lembrete: lembrete.trim(),
            };

            const dadosSalvos =
                await AsyncStorage.getItem('orientacoes');

            const orientacoesAtuais: Orientacao[] =
                dadosSalvos ? JSON.parse(dadosSalvos) : [];

            const novaLista = [
                ...orientacoesAtuais,
                novaOrientacao,
            ];

            await AsyncStorage.setItem(
                'orientacoes',
                JSON.stringify(novaLista)
            );

            Alert.alert(
                'Orientação salva! 💙',
                'O conteúdo foi cadastrado com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/admin-orientacoes'),
                    },
                ]
            );
        } catch (erro) {
            console.log(
                'Erro ao salvar orientação:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível salvar a orientação.'
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
                    {/* Cabeçalho */}
                    <View style={styles.cabecalho}>
                        <Pressable
                            style={styles.botaoVoltar}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.seta}>‹</Text>
                        </Pressable>

                        <Text style={styles.tituloPagina}>
                            Nova orientação
                        </Text>

                        <Text style={styles.estrela}>
                            ★
                        </Text>
                    </View>

                    {/* Introdução */}
                    <View style={styles.apresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Text style={styles.emojiApresentacao}>
                                📚
                            </Text>
                        </View>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Cadastrar conteúdo
                            </Text>

                            <Text style={styles.subtituloApresentacao}>
                                Adicione uma nova orientação para os responsáveis.
                            </Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.card}>
                        <Text style={styles.label}>
                            Título da orientação *
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Ex.: Lidando com mudanças na rotina"
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

                        <Text style={styles.label}>
                            Introdução *
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputGrande,
                            ]}
                            placeholder="Explique brevemente o assunto da orientação..."
                            placeholderTextColor="#A1AAAE"
                            value={introducao}
                            onChangeText={setIntroducao}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.tituloDicas}>
                            <Text style={styles.labelSemMargem}>
                                Dicas práticas
                            </Text>

                            <Text style={styles.textoOpcional}>
                                pelo menos 1
                            </Text>
                        </View>

                        <View style={styles.campoDica}>
                            <View style={styles.numeroDica}>
                                <Text style={styles.numeroDicaTexto}>
                                    1
                                </Text>
                            </View>

                            <TextInput
                                style={styles.inputDica}
                                placeholder="Primeira dica *"
                                placeholderTextColor="#A1AAAE"
                                value={dica1}
                                onChangeText={setDica1}
                                multiline
                            />
                        </View>

                        <View style={styles.campoDica}>
                            <View style={styles.numeroDica}>
                                <Text style={styles.numeroDicaTexto}>
                                    2
                                </Text>
                            </View>

                            <TextInput
                                style={styles.inputDica}
                                placeholder="Segunda dica"
                                placeholderTextColor="#A1AAAE"
                                value={dica2}
                                onChangeText={setDica2}
                                multiline
                            />
                        </View>

                        <View style={styles.campoDica}>
                            <View style={styles.numeroDica}>
                                <Text style={styles.numeroDicaTexto}>
                                    3
                                </Text>
                            </View>

                            <TextInput
                                style={styles.inputDica}
                                placeholder="Terceira dica"
                                placeholderTextColor="#A1AAAE"
                                value={dica3}
                                onChangeText={setDica3}
                                multiline
                            />
                        </View>

                        <View style={styles.campoDica}>
                            <View style={styles.numeroDica}>
                                <Text style={styles.numeroDicaTexto}>
                                    4
                                </Text>
                            </View>

                            <TextInput
                                style={styles.inputDica}
                                placeholder="Quarta dica"
                                placeholderTextColor="#A1AAAE"
                                value={dica4}
                                onChangeText={setDica4}
                                multiline
                            />
                        </View>

                        <Text style={styles.label}>
                            Lembrete *
                        </Text>

                        <TextInput
                            style={[
                                styles.input,
                                styles.inputLembrete,
                            ]}
                            placeholder="Ex.: Cada criança é única. Respeite seu tempo."
                            placeholderTextColor="#A1AAAE"
                            value={lembrete}
                            onChangeText={setLembrete}
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={styles.aviso}>
                            * Campos obrigatórios
                        </Text>

                        <Pressable
                            style={styles.botaoSalvar}
                            onPress={salvarOrientacao}
                        >
                            <Text style={styles.textoBotaoSalvar}>
                                Salvar orientação
                            </Text>
                        </Pressable>
                    </View>

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

    apresentacao: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        paddingHorizontal: 4,
    },

    iconeApresentacao: {
        width: 57,
        height: 57,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiApresentacao: {
        fontSize: 29,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
    },

    subtituloApresentacao: {
        color: '#77858B',
        fontSize: 11,
        lineHeight: 16,
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

    labelSemMargem: {
        color: '#4D5A60',
        fontSize: 13,
        fontWeight: '700',
    },

    input: {
        minHeight: 50,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 14,
        color: '#3E494F',
        fontSize: 13,
        marginBottom: 17,
    },

    inputGrande: {
        height: 105,
        paddingTop: 13,
    },

    inputLembrete: {
        height: 85,
        paddingTop: 13,
    },

    gradeCategorias: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 17,
    },

    categoria: {
        width: '48%',
        minHeight: 75,
        borderRadius: 15,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
        paddingHorizontal: 5,
    },

    categoriaSelecionada: {
        backgroundColor: '#FFE1EA',
        borderColor: '#FF7FA3',
        borderWidth: 2,
    },

    iconeCategoria: {
        fontSize: 25,
        marginBottom: 4,
    },

    textoCategoria: {
        color: '#667277',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },

    textoCategoriaSelecionada: {
        color: '#E75E87',
        fontWeight: '700',
    },

    tituloDicas: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9,
    },

    textoOpcional: {
        color: '#9AA6AB',
        fontSize: 9,
    },

    campoDica: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 9,
    },

    numeroDica: {
        width: 29,
        height: 29,
        borderRadius: 15,
        backgroundColor: '#DDF3FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },

    numeroDicaTexto: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
    },

    inputDica: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: '#F7FAFB',
        borderWidth: 1,
        borderColor: '#D7E7EC',
        paddingHorizontal: 13,
        paddingVertical: 10,
        color: '#3E494F',
        fontSize: 12,
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