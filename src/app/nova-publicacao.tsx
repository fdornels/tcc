import { router } from 'expo-router';
import {
    addDoc,
    collection,
    serverTimestamp,
} from 'firebase/firestore';
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
import { auth, db } from '../../config/firebase';

const categorias = [
    'Comunicação',
    'Alimentação',
    'Escola',
    'Sensorial',
    'Rotina',
    'Outros',
];

export default function NovaPublicacaoScreen() {
    const [titulo, setTitulo] = useState('');
    const [texto, setTexto] = useState('');
    const [categoria, setCategoria] = useState('');
    const [salvando, setSalvando] = useState(false);

    async function continuar() {
        if (!titulo.trim()) {
            Alert.alert(
                'Atenção',
                'Digite um título para a publicação.'
            );
            return;
        }

        if (!categoria) {
            Alert.alert(
                'Atenção',
                'Escolha uma categoria.'
            );
            return;
        }

        if (!texto.trim()) {
            Alert.alert(
                'Atenção',
                'Escreva sua publicação.'
            );
            return;
        }

        const usuario = auth.currentUser;

        if (!usuario) {
            Alert.alert(
                'Erro',
                'Você precisa estar conectada para publicar.'
            );
            return;
        }

        try {
            setSalvando(true);

            await addDoc(
                collection(db, 'publicacoes'),
                {
                    autorId: usuario.uid,
                    autorNome:
                        usuario.displayName ||
                        usuario.email?.split('@')[0] ||
                        'Responsável',

                    titulo: titulo.trim(),
                    texto: texto.trim(),
                    categoria,

                    criadoEm: serverTimestamp(),
                }
            );

            Alert.alert(
                'Publicado! 💙',
                'Sua publicação foi compartilhada na comunidade.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/comunidade'),
                    },
                ]
            );
        } catch (erro) {
            console.log(
                'Erro ao criar publicação:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível publicar. Tente novamente.'
            );
        } finally {
            setSalvando(false);
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

                        <Text style={styles.tituloPagina}>
                            Nova publicação
                        </Text>

                        <Text style={styles.estrela}>★</Text>
                    </View>

                    {/* APRESENTAÇÃO */}
                    <View style={styles.apresentacao}>
                        <Text style={styles.emojiApresentacao}>
                            💭
                        </Text>

                        <View style={styles.textoApresentacao}>
                            <Text style={styles.tituloApresentacao}>
                                Compartilhe com a comunidade
                            </Text>

                            <Text style={styles.subtituloApresentacao}>
                                Conte uma experiência, compartilhe
                                uma ideia ou tire uma dúvida.
                            </Text>
                        </View>
                    </View>

                    {/* TÍTULO */}
                    <Text style={styles.label}>
                        Título
                    </Text>

                    <TextInput
                        style={styles.input}
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ex.: Adaptação à escola"
                        placeholderTextColor="#9AA5AA"
                        maxLength={80}
                    />

                    <Text style={styles.contador}>
                        {titulo.length}/80
                    </Text>

                    {/* CATEGORIA */}
                    <Text style={styles.label}>
                        Categoria
                    </Text>

                    <View style={styles.categorias}>
                        {categorias.map((item) => {
                            const selecionada =
                                categoria === item;

                            return (
                                <Pressable
                                    key={item}
                                    style={[
                                        styles.categoria,
                                        selecionada &&
                                        styles.categoriaSelecionada,
                                    ]}
                                    onPress={() =>
                                        setCategoria(item)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.textoCategoria,
                                            selecionada &&
                                            styles.textoCategoriaSelecionada,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* PUBLICAÇÃO */}
                    <Text style={styles.label}>
                        Sua publicação
                    </Text>

                    <TextInput
                        style={styles.inputTexto}
                        value={texto}
                        onChangeText={setTexto}
                        placeholder="Escreva aqui o que você gostaria de compartilhar..."
                        placeholderTextColor="#9AA5AA"
                        multiline
                        textAlignVertical="top"
                        maxLength={1000}
                    />

                    <Text style={styles.contador}>
                        {texto.length}/1000
                    </Text>

                    {/* AVISO */}
                    <View style={styles.aviso}>
                        <Text style={styles.iconeAviso}>
                            💙
                        </Text>

                        <Text style={styles.textoAviso}>
                            Este é um espaço de apoio e respeito.
                            Evite compartilhar informações pessoais
                            ou sensíveis.
                        </Text>
                    </View>

                    {/* PUBLICAR */}
                    <Pressable
                        style={[
                            styles.botaoPublicar,
                            salvando && { opacity: 0.6 },
                        ]}
                        onPress={continuar}
                        disabled={salvando}
                    >
                        <Text style={styles.textoBotao}>
                            {salvando ? 'Publicando...' : 'Publicar'}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF5FC',
    },

    flex: {
        flex: 1,
    },

    conteudo: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    cabecalho: {
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    botaoVoltar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    seta: {
        fontSize: 30,
        color: '#4DA4CF',
        marginTop: -4,
    },

    tituloPagina: {
        fontSize: 19,
        fontWeight: '700',
        color: '#4B5A60',
    },

    estrela: {
        fontSize: 26,
        color: '#F6C945',
    },

    apresentacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },

    emojiApresentacao: {
        fontSize: 34,
        marginRight: 13,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 4,
    },

    subtituloApresentacao: {
        fontSize: 11,
        color: '#8B979C',
        lineHeight: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 8,
        marginLeft: 3,
    },

    input: {
        height: 52,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#4B5A60',
    },

    inputTexto: {
        minHeight: 170,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        fontSize: 14,
        lineHeight: 21,
        color: '#4B5A60',
    },

    contador: {
        textAlign: 'right',
        fontSize: 10,
        color: '#9AA5AA',
        marginTop: 5,
        marginBottom: 18,
        marginRight: 5,
    },

    categorias: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 22,
    },

    categoria: {
        paddingHorizontal: 13,
        paddingVertical: 9,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
    },

    categoriaSelecionada: {
        backgroundColor: '#FF85A8',
    },

    textoCategoria: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64757C',
    },

    textoCategoriaSelecionada: {
        color: '#FFFFFF',
    },

    aviso: {
        backgroundColor: '#FFF5CF',
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 20,
    },

    iconeAviso: {
        fontSize: 20,
        marginRight: 10,
    },

    textoAviso: {
        flex: 1,
        fontSize: 10,
        lineHeight: 15,
        color: '#756C54',
    },

    botaoPublicar: {
        height: 54,
        borderRadius: 20,
        backgroundColor: '#FF6F9C',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});