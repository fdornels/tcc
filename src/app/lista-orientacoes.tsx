import { router, useLocalSearchParams } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Orientacao = {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    icone: string;
};

const orientacoes: Orientacao[] = [
    {
        id: '1',
        titulo: 'Como agir em uma crise sensorial',
        descricao:
            'Estratégias para acolher a criança durante momentos de sobrecarga sensorial.',
        categoria: 'Crise Sensorial',
        icone: '🧩',
    },
    {
        id: '2',
        titulo: 'Identificando sinais de sobrecarga',
        descricao:
            'Conheça alguns sinais que podem indicar desconforto ou sobrecarga sensorial.',
        categoria: 'Crise Sensorial',
        icone: '💙',
    },
    {
        id: '3',
        titulo: 'Criando um ambiente mais tranquilo',
        descricao:
            'Veja formas de tornar o ambiente mais confortável e previsível.',
        categoria: 'Crise Sensorial',
        icone: '☁️',
    },

    {
        id: '4',
        titulo: 'Incentivando a comunicação',
        descricao:
            'Conheça maneiras de apoiar a comunicação respeitando o ritmo da criança.',
        categoria: 'Comunicação',
        icone: '💬',
    },
    {
        id: '5',
        titulo: 'Comunicação além da fala',
        descricao:
            'Entenda como gestos, imagens e outras formas de expressão podem ajudar.',
        categoria: 'Comunicação',
        icone: '🗨️',
    },
    {
        id: '6',
        titulo: 'Dando tempo para responder',
        descricao:
            'Saiba por que respeitar o tempo de processamento pode facilitar a comunicação.',
        categoria: 'Comunicação',
        icone: '⏳',
    },

    {
        id: '7',
        titulo: 'Criando uma rotina previsível',
        descricao:
            'Veja como organizar atividades do dia de forma mais clara e previsível.',
        categoria: 'Rotinas',
        icone: '🌈',
    },
    {
        id: '8',
        titulo: 'Preparando para mudanças',
        descricao:
            'Estratégias para comunicar mudanças e ajudar na adaptação da rotina.',
        categoria: 'Rotinas',
        icone: '📅',
    },
    {
        id: '9',
        titulo: 'Rotina visual',
        descricao:
            'Entenda como recursos visuais podem auxiliar na organização das atividades.',
        categoria: 'Rotinas',
        icone: '🖼️',
    },

    {
        id: '10',
        titulo: 'Conhecendo os direitos',
        descricao:
            'Informações introdutórias sobre direitos da pessoa com Transtorno do Espectro Autista.',
        categoria: 'Direitos',
        icone: '⚖️',
    },
    {
        id: '11',
        titulo: 'Inclusão no ambiente escolar',
        descricao:
            'Conheça aspectos importantes relacionados à inclusão e ao ambiente escolar.',
        categoria: 'Direitos',
        icone: '🎒',
    },
    {
        id: '12',
        titulo: 'Atendimento prioritário',
        descricao:
            'Entenda informações gerais relacionadas ao atendimento prioritário.',
        categoria: 'Direitos',
        icone: '⭐',
    },
];

export default function ListaOrientacoesScreen() {
    const params = useLocalSearchParams();

    const categoriaParametro = Array.isArray(params.categoria)
        ? params.categoria[0]
        : params.categoria;

    const categoria = categoriaParametro || 'Orientações';

    const listaFiltrada = orientacoes.filter(
        (item) => item.categoria === categoria
    );

    function voltar() {
        router.back();
    }

    function abrirOrientacao(item: Orientacao) {
        router.push({
            pathname: '/orientacao-detalhes',
            params: {
                id: item.id,
            },
        });
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
                        onPress={voltar}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.tituloPagina}>
                        {categoria}
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Introdução */}
                <View style={styles.introducao}>
                    <Text style={styles.iconeIntroducao}>
                        {categoria === 'Crise Sensorial'
                            ? '🧩'
                            : categoria === 'Comunicação'
                                ? '💬'
                                : categoria === 'Rotinas'
                                    ? '🌈'
                                    : '⚖️'}
                    </Text>

                    <View style={styles.textoIntroducao}>
                        <Text style={styles.tituloIntroducao}>
                            Orientações sobre {categoria}
                        </Text>

                        <Text style={styles.subtituloIntroducao}>
                            Conteúdos para apoiar e orientar no dia a dia.
                        </Text>
                    </View>
                </View>

                {/* Quantidade */}
                <Text style={styles.tituloSecao}>
                    Conteúdos
                </Text>

                <Text style={styles.quantidade}>
                    {listaFiltrada.length}{' '}
                    {listaFiltrada.length === 1
                        ? 'orientação encontrada'
                        : 'orientações encontradas'}
                </Text>

                {/* Lista */}
                {listaFiltrada.length === 0 ? (
                    <View style={styles.vazio}>
                        <Text style={styles.iconeVazio}>📚</Text>

                        <Text style={styles.tituloVazio}>
                            Nenhuma orientação encontrada
                        </Text>

                        <Text style={styles.textoVazio}>
                            Ainda não existem conteúdos nesta categoria.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.lista}>
                        {listaFiltrada.map((item) => (
                            <Pressable
                                key={item.id}
                                style={styles.card}
                                onPress={() => abrirOrientacao(item)}
                            >
                                <View style={styles.iconeCard}>
                                    <Text style={styles.emojiCard}>
                                        {item.icone}
                                    </Text>
                                </View>

                                <View style={styles.conteudoCard}>
                                    <Text style={styles.tituloCard}>
                                        {item.titulo}
                                    </Text>

                                    <Text
                                        style={styles.descricaoCard}
                                        numberOfLines={3}
                                    >
                                        {item.descricao}
                                    </Text>

                                    <Text style={styles.lerMais}>
                                        Ler orientação ›
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Decoração */}
                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>☁️</Text>
                    <Text style={styles.coracao}>♥</Text>
                    <Text style={styles.decoracaoEmoji}>🌈</Text>
                </View>
            </ScrollView>
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
        flex: 1,
        paddingHorizontal: 10,
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

    introducao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 23,
    },

    iconeIntroducao: {
        fontSize: 39,
        marginRight: 13,
    },

    textoIntroducao: {
        flex: 1,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
    },

    subtituloIntroducao: {
        color: '#7D898E',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 17,
        fontWeight: '700',
    },

    quantidade: {
        color: '#829096',
        fontSize: 11,
        marginTop: 4,
        marginBottom: 14,
    },

    lista: {
        gap: 11,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 13,
        flexDirection: 'row',
        minHeight: 125,
    },

    iconeCard: {
        width: 63,
        height: 63,
        borderRadius: 17,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiCard: {
        fontSize: 30,
    },

    conteudoCard: {
        flex: 1,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 14,
        fontWeight: '700',
    },

    descricaoCard: {
        color: '#77858B',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 5,
    },

    lerMais: {
        color: '#42A5D5',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 7,
    },

    vazio: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingVertical: 35,
        paddingHorizontal: 20,
        alignItems: 'center',
    },

    iconeVazio: {
        fontSize: 37,
    },

    tituloVazio: {
        color: '#4D5A60',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 10,
    },

    textoVazio: {
        color: '#929DA2',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 5,
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 25,
    },

    decoracaoEmoji: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
});