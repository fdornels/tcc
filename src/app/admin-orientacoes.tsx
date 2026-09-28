import { router } from 'expo-router';
import {
    Alert,
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
    categoria: string;
    icone: string;
};

const orientacoes: Orientacao[] = [
    {
        id: '1',
        titulo: 'Como agir em uma crise sensorial',
        categoria: 'Crise Sensorial',
        icone: '🧩',
    },
    {
        id: '2',
        titulo: 'Identificando sinais de sobrecarga',
        categoria: 'Crise Sensorial',
        icone: '💙',
    },
    {
        id: '3',
        titulo: 'Criando um ambiente mais tranquilo',
        categoria: 'Crise Sensorial',
        icone: '☁️',
    },
    {
        id: '4',
        titulo: 'Incentivando a comunicação',
        categoria: 'Comunicação',
        icone: '💬',
    },
    {
        id: '5',
        titulo: 'Comunicação além da fala',
        categoria: 'Comunicação',
        icone: '🗨️',
    },
    {
        id: '6',
        titulo: 'Dando tempo para responder',
        categoria: 'Comunicação',
        icone: '⏳',
    },
    {
        id: '7',
        titulo: 'Criando uma rotina previsível',
        categoria: 'Rotinas',
        icone: '🌈',
    },
    {
        id: '8',
        titulo: 'Preparando para mudanças',
        categoria: 'Rotinas',
        icone: '📅',
    },
    {
        id: '9',
        titulo: 'Rotina visual',
        categoria: 'Rotinas',
        icone: '🖼️',
    },
    {
        id: '10',
        titulo: 'Conhecendo os direitos',
        categoria: 'Direitos',
        icone: '⚖️',
    },
    {
        id: '11',
        titulo: 'Inclusão no ambiente escolar',
        categoria: 'Direitos',
        icone: '🎒',
    },
    {
        id: '12',
        titulo: 'Atendimento prioritário',
        categoria: 'Direitos',
        icone: '⭐',
    },
];

export default function AdminOrientacoesScreen() {
    function abrirOpcoes(item: Orientacao) {
        Alert.alert(
            item.titulo,
            'O que você deseja fazer?',
            [
                {
                    text: 'Editar',
                    onPress: () => {
                        /*
                         * Vamos conectar ao formulário de edição
                         * na próxima etapa.
                         */
                        Alert.alert(
                            'Editar orientação',
                            'O formulário de edição será criado na próxima etapa.'
                        );
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

    function confirmarExclusao(item: Orientacao) {
        Alert.alert(
            'Excluir orientação',
            `Deseja realmente excluir "${item.titulo}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        /*
                         * A exclusão real será ligada ao
                         * AsyncStorage na próxima etapa.
                         */
                        Alert.alert(
                            'Em breve',
                            'Vamos conectar a exclusão ao armazenamento.'
                        );
                    },
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
                        onPress={() => router.back()}
                    >
                        <Text style={styles.seta}>‹</Text>
                    </Pressable>

                    <Text style={styles.tituloCabecalho}>
                        Gerenciar orientações
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Introdução */}
                <View style={styles.introducao}>
                    <View style={styles.iconeIntroducao}>
                        <Text style={styles.emojiIntroducao}>
                            📚
                        </Text>
                    </View>

                    <View style={styles.textoIntroducao}>
                        <Text style={styles.tituloIntroducao}>
                            Conteúdos do TEAjudo
                        </Text>

                        <Text style={styles.subtituloIntroducao}>
                            Cadastre, edite e exclua orientações disponíveis
                            para os responsáveis.
                        </Text>
                    </View>
                </View>

                {/* Título da lista */}
                <View style={styles.cabecalhoLista}>
                    <Text style={styles.tituloSecao}>
                        Orientações cadastradas
                    </Text>

                    <Text style={styles.quantidade}>
                        {orientacoes.length} conteúdos
                    </Text>
                </View>

                {/* Lista */}
                <View style={styles.lista}>
                    {orientacoes.map((item) => (
                        <View
                            key={item.id}
                            style={styles.card}
                        >
                            <View style={styles.iconeCard}>
                                <Text style={styles.emojiCard}>
                                    {item.icone}
                                </Text>
                            </View>

                            <View style={styles.conteudoCard}>
                                <Text style={styles.categoria}>
                                    {item.categoria}
                                </Text>

                                <Text
                                    style={styles.tituloCard}
                                    numberOfLines={2}
                                >
                                    {item.titulo}
                                </Text>
                            </View>

                            <Pressable
                                style={styles.botaoOpcoes}
                                onPress={() => abrirOpcoes(item)}
                                hitSlop={10}
                            >
                                <Text style={styles.opcoes}>•••</Text>
                            </Pressable>
                        </View>
                    ))}
                </View>

                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>🧩</Text>
                    <Text style={styles.coracao}>♥</Text>
                    <Text style={styles.decoracaoEmoji}>🌈</Text>
                </View>
            </ScrollView>

            {/* Botão para cadastrar */}
            <Pressable
                style={styles.botaoAdicionar}
                onPress={() => router.push('/nova-orientacao')}
            >
                <Text style={styles.mais}>+</Text>
            </Pressable>
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
        paddingBottom: 105,
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

    tituloCabecalho: {
        flex: 1,
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 8,
    },

    estrela: {
        width: 36,
        color: '#FFD447',
        fontSize: 29,
        textAlign: 'center',
    },

    introducao: {
        backgroundColor: '#FFFFFF',
        borderRadius: 23,
        padding: 17,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    iconeIntroducao: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: '#DDF3FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiIntroducao: {
        fontSize: 29,
    },

    textoIntroducao: {
        flex: 1,
    },

    tituloIntroducao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    subtituloIntroducao: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 4,
    },

    cabecalhoLista: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
    },

    quantidade: {
        color: '#42A5D5',
        fontSize: 10,
    },

    lista: {
        gap: 10,
    },

    card: {
        minHeight: 86,
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconeCard: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#EDF8FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 11,
    },

    emojiCard: {
        fontSize: 25,
    },

    conteudoCard: {
        flex: 1,
    },

    categoria: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginBottom: 3,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '700',
    },

    botaoOpcoes: {
        width: 36,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    opcoes: {
        color: '#9DA8AC',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 1,
    },

    botaoAdicionar: {
        position: 'absolute',
        right: 22,
        bottom: 25,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#FF7FA3',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 7,
    },

    mais: {
        color: '#FFFFFF',
        fontSize: 35,
        fontWeight: '300',
        marginTop: -3,
    },

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 24,
    },

    decoracaoEmoji: {
        fontSize: 30,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
});