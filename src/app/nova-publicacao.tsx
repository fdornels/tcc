import { Ionicons } from '@expo/vector-icons';
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
    { nome: 'Comunicação', icone: 'chatbubble-ellipses-outline' },
    { nome: 'Alimentação', icone: 'restaurant-outline' },
    { nome: 'Escola', icone: 'school-outline' },
    { nome: 'Sensorial', icone: 'options-outline' },
    { nome: 'Rotina', icone: 'repeat-outline' },
    { nome: 'Outros', icone: 'ellipsis-horizontal-outline' },
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
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
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
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color="#42A5D5"
                            />
                        </Pressable>

                        <Text style={styles.tituloPagina}>
                            Nova publicação
                        </Text>

                        <View style={{ width: 40 }} />
                    </View>

                    {/* APRESENTAÇÃO */}
                    <View style={styles.apresentacao}>
                        <View style={styles.iconeApresentacao}>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={24}
                                color="#42A5D5"
                            />
                        </View>

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
                                    <Ionicons
                                        name={item.icone as any}
                                        size={15}
                                        color={
                                            selecionada
                                                ? '#FFFFFF'
                                                : '#42A5D5'
                                        }
                                    />

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
                        <View style={styles.iconeAviso}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={20}
                                color="#42A5D5"
                            />
                        </View>

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
        backgroundColor: '#F9FCFD',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2F1F5',
    },

    iconeAviso: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    textoAviso: {
        flex: 1,
        fontSize: 10,
        lineHeight: 15,
        color: '#718087',
    },

    botaoPublicar: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#42A5D5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textoBotao: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
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
    iconeApresentacao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },
});