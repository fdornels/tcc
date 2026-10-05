import {
    router,
    useFocusEffect,
} from 'expo-router';

import { useCallback, useState } from 'react';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    collection,
    getDocs,
    orderBy,
    query,
} from 'firebase/firestore';

import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config/firebase';


const categorias = [
    { nome: 'Todos', icone: 'apps-outline' },
    { nome: 'Comunicação', icone: 'chatbubbles-outline' },
    { nome: 'Alimentação', icone: 'restaurant-outline' },
    { nome: 'Escola', icone: 'school-outline' },
    { nome: 'Sensorial', icone: 'options-outline' },
    { nome: 'Rotina', icone: 'time-outline' },
    { nome: 'Outros', icone: 'ellipsis-horizontal-outline' },
];
type Publicacao = {
    id: string;
    autorId: string;
    autorNome: string;
    titulo: string;
    texto: string;
    categoria: string;
    criadoEm?: any;
};

export default function ComunidadeScreen() {
    const [busca, setBusca] = useState('');
    const [categoriaSelecionada, setCategoriaSelecionada] =
        useState('Todos');

    const [publicacoes, setPublicacoes] =
        useState<Publicacao[]>([]);

    useFocusEffect(
        useCallback(() => {
            carregarPublicacoes();
        }, [])
    );

    async function carregarPublicacoes() {
        try {
            const referencia = query(
                collection(db, 'publicacoes'),
                orderBy('criadoEm', 'desc')
            );

            const resultado = await getDocs(referencia);

            const lista: Publicacao[] =
                resultado.docs.map((documento) => ({
                    id: documento.id,
                    ...(documento.data() as Omit<
                        Publicacao,
                        'id'
                    >),
                }));

            setPublicacoes(lista);

            console.log(
                'PUBLICAÇÕES CARREGADAS:',
                lista.length
            );
        } catch (erro) {
            console.log(
                'Erro ao carregar publicações:',
                erro
            );
        }
    }
    const publicacoesFiltradas = publicacoes.filter((publicacao) => {
        const correspondeCategoria =
            categoriaSelecionada === 'Todos' ||
            publicacao.categoria === categoriaSelecionada;

        const termo = busca.trim().toLowerCase();

        const correspondeBusca =
            termo === '' ||
            publicacao.titulo.toLowerCase().includes(termo) ||
            publicacao.texto.toLowerCase().includes(termo) ||
            publicacao.autorNome.toLowerCase().includes(termo);

        return correspondeCategoria && correspondeBusca;
    });
    return (
        <SafeAreaView style={styles.container}>
            <View pointerEvents="none" style={styles.decoracaoFundo}>
                <View style={styles.manchaRosaTopo} />
                <View style={styles.manchaAzulTopo} />
                <View style={styles.manchaRosaBaixo} />
                <View style={styles.manchaAzulBaixo} />
            </View>
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

                    <Text style={styles.tituloPagina}>
                        Comunidade
                    </Text>

                    <View style={{ width: 36 }} />
                </View>
                {/* APRESENTAÇÃO */}
                <View style={styles.apresentacao}>
                    <View style={styles.iconeApresentacao}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={25}
                            color="#42A5D5"
                        />
                    </View>

                    <View style={styles.textoApresentacao}>
                        <Text style={styles.tituloApresentacao}>
                            Comunidade de apoio
                        </Text>

                        <Text style={styles.subtituloApresentacao}>
                            Compartilhe experiências, converse e
                            tire dúvidas com outros responsáveis.
                        </Text>
                    </View>
                </View>

                {/* BUSCA */}
                <View style={styles.campoBusca}>
                    <Ionicons
                        name="search-outline"
                        size={18}
                        color="#42A5D5"
                    />

                    <TextInput
                        style={styles.inputBusca}
                        value={busca}
                        onChangeText={setBusca}
                        placeholder="Buscar na comunidade..."
                        placeholderTextColor="#8B979C"
                    />
                </View>

                {/* CATEGORIAS */}
                <Text style={styles.tituloSecao}>
                    Categorias
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listaCategorias}
                >
                    {categorias.map((categoria) => {
                        const selecionada =
                            categoriaSelecionada === categoria.nome;

                        return (
                            <Pressable
                                key={categoria.nome}
                                style={[
                                    styles.categoria,
                                    selecionada &&
                                    styles.categoriaSelecionada,
                                ]}
                                onPress={() =>
                                    setCategoriaSelecionada(
                                        categoria.nome
                                    )
                                }
                            >
                                <Ionicons
                                    name={categoria.icone as any}
                                    size={16}
                                    color={selecionada ? '#FFFFFF' : '#42A5D5'}
                                />

                                <Text
                                    style={[
                                        styles.nomeCategoria,
                                        selecionada &&
                                        styles.nomeCategoriaSelecionada,
                                    ]}
                                >
                                    {categoria.nome}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* PUBLICAÇÕES */}
                <View style={styles.tituloPublicacoes}>
                    <Text style={styles.tituloSecao}>
                        Publicações recentes
                    </Text>
                </View>

                {publicacoesFiltradas.length === 0 ? (
                    <View style={styles.cardVazio}>
                        <View style={styles.iconeVazio}>
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={30}
                                color="#42A5D5"
                            />
                        </View>

                        <Text style={styles.tituloVazio}>
                            Nenhuma publicação ainda
                        </Text>

                        <Text style={styles.textoVazio}>
                            Seja a primeira pessoa a compartilhar uma
                            experiência ou tirar uma dúvida.
                        </Text>
                    </View>
                ) : (
                    publicacoesFiltradas.map((publicacao) => (
                        <Pressable
                            key={publicacao.id}
                            style={styles.cardPublicacao}
                            onPress={() =>
                                router.push({
                                    pathname: '/publicacao-detalhes',
                                    params: {
                                        id: publicacao.id,
                                        titulo: publicacao.titulo,
                                        texto: publicacao.texto,
                                        categoria: publicacao.categoria,
                                        autorNome: publicacao.autorNome,
                                        autorId: publicacao.autorId,
                                    },
                                })
                            }
                        >
                            <View style={styles.topoPublicacao}>
                                <Text style={styles.categoriaPublicacao}>
                                    {publicacao.categoria}
                                </Text>

                                <View style={styles.iconePublicacao}>
                                    <Ionicons
                                        name="chatbubble-ellipses-outline"
                                        size={17}
                                        color="#42A5D5"
                                    />
                                </View>
                            </View>

                            <Text style={styles.tituloPublicacao}>
                                {publicacao.titulo}
                            </Text>

                            <Text
                                style={styles.textoPublicacao}
                                numberOfLines={3}
                            >
                                {publicacao.texto}
                            </Text>

                            <View style={styles.rodapePublicacao}>
                                <View style={styles.autorContainer}>
                                    <Ionicons
                                        name="person-outline"
                                        size={14}
                                        color="#42A5D5"
                                    />

                                    <Text style={styles.autorPublicacao}>
                                        {publicacao.autorNome}
                                    </Text>
                                </View>

                                <Text style={styles.verMais}>
                                    Ver publicação ›
                                </Text>
                            </View>
                        </Pressable>
                    ))
                )}
            </ScrollView>

            {/* BOTÃO + */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() => router.push('/nova-publicacao')}
            >
                <Text style={styles.mais}>＋</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
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

    conteudo: {
        paddingHorizontal: 20,
        paddingBottom: 110,
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
        marginBottom: 16,
    },

    iconeApresentacao: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    emojiApresentacao: {
        fontSize: 27,
    },

    textoApresentacao: {
        flex: 1,
    },

    tituloApresentacao: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 5,
    },

    subtituloApresentacao: {
        fontSize: 12,
        lineHeight: 17,
        color: '#8B979C',
    },

    campoBusca: {
        height: 50,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 20,
    },

    lupa: {
        fontSize: 21,
        color: '#4DA4CF',
        marginRight: 8,
    },

    inputBusca: {
        flex: 1,
        fontSize: 14,
        color: '#4B5A60',
    },

    tituloSecao: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 10,
    },

    listaCategorias: {
        paddingBottom: 20,
        gap: 8,
    },

    categoria: {
        height: 38,
        paddingHorizontal: 13,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    categoriaSelecionada: {
        backgroundColor: '#FF85A8',
    },

    iconeCategoria: {
        fontSize: 14,
        marginRight: 5,
    },

    nomeCategoria: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64757C',
    },

    nomeCategoriaSelecionada: {
        color: '#FFFFFF',
    },

    tituloPublicacoes: {
        marginTop: 2,
    },

    cardVazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        minHeight: 190,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emojiVazio: {
        fontSize: 39,
        marginBottom: 10,
    },

    tituloVazio: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 7,
        textAlign: 'center',
    },

    textoVazio: {
        fontSize: 12,
        color: '#8B979C',
        lineHeight: 18,
        textAlign: 'center',
        maxWidth: 270,
    },

    botaoAdicionar: {
        position: 'absolute',
        right: 24,
        bottom: 28,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FF6F9C',
        alignItems: 'center',
        justifyContent: 'center',

        elevation: 7,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
    },

    mais: {
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: '300',
        marginTop: -3,
    },
    cardPublicacao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        marginBottom: 12,
    },

    topoPublicacao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 9,
    },

    categoriaPublicacao: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4DA4CF',
        backgroundColor: '#EAF8FC',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },

    iconePublicacao: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    tituloPublicacao: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 7,
    },

    textoPublicacao: {
        fontSize: 12,
        lineHeight: 18,
        color: '#75848A',
        marginBottom: 14,
    },

    rodapePublicacao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    autorContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    autorPublicacao: {
        fontSize: 11,
        color: '#8B979C',
    },

    verMais: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FF6F9C',
    },
    iconeVazio: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#EAF7FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
});