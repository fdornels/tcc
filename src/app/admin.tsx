import { router } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminScreen() {
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
                        Administração
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Boas-vindas */}
                <View style={styles.boasVindas}>
                    <View style={styles.iconeAdmin}>
                        <Text style={styles.emojiAdmin}>👩‍💻</Text>
                    </View>

                    <View style={styles.textoBoasVindas}>
                        <Text style={styles.tituloBoasVindas}>
                            Olá, Administrador 👋
                        </Text>

                        <Text style={styles.subtituloBoasVindas}>
                            Gerencie os conteúdos e informações do TEAjudo.
                        </Text>
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.tituloSecao}>
                    Painel administrativo
                </Text>

                {/* Gerenciar orientações */}
                <Pressable
                    style={styles.cardPrincipal}
                    onPress={() => router.push('/admin-orientacoes')}
                >
                    <View style={[styles.iconeCard, styles.fundoAzul]}>
                        <Text style={styles.emojiCard}>📚</Text>
                    </View>

                    <View style={styles.conteudoCard}>
                        <Text style={styles.tituloCard}>
                            Gerenciar orientações
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Cadastre, edite ou exclua conteúdos disponíveis
                            para os responsáveis.
                        </Text>
                    </View>

                    <Text style={styles.setaCard}>›</Text>
                </Pressable>

                {/* Visualizar aplicativo */}
                <Pressable
                    style={styles.cardPrincipal}
                    onPress={() => router.push('/orientacoes')}
                >
                    <View style={[styles.iconeCard, styles.fundoRosa]}>
                        <Text style={styles.emojiCard}>👀</Text>
                    </View>

                    <View style={styles.conteudoCard}>
                        <Text style={styles.tituloCard}>
                            Visualizar orientações
                        </Text>

                        <Text style={styles.descricaoCard}>
                            Veja como os conteúdos aparecem para o responsável.
                        </Text>
                    </View>

                    <Text style={styles.setaCard}>›</Text>
                </Pressable>

                {/* Informações */}
                <View style={styles.cardInformacao}>
                    <Text style={styles.iconeInformacao}>💡</Text>

                    <View style={styles.textoInformacao}>
                        <Text style={styles.tituloInformacao}>
                            Área administrativa
                        </Text>

                        <Text style={styles.descricaoInformacao}>
                            As alterações realizadas nas orientações serão
                            disponibilizadas na área do responsável.
                        </Text>
                    </View>
                </View>

                {/* Resumo */}
                <Text style={styles.tituloSecao}>
                    Resumo
                </Text>

                <View style={styles.resumo}>
                    <View style={styles.cardResumo}>
                        <Text style={styles.numeroResumo}>12</Text>
                        <Text style={styles.textoResumo}>
                            Orientações
                        </Text>
                    </View>

                    <View style={styles.cardResumo}>
                        <Text style={styles.numeroResumo}>4</Text>
                        <Text style={styles.textoResumo}>
                            Categorias
                        </Text>
                    </View>
                </View>

                {/* Decoração */}
                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>🧩</Text>
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

    tituloCabecalho: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 29,
    },

    boasVindas: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },

    iconeAdmin: {
        width: 62,
        height: 62,
        borderRadius: 20,
        backgroundColor: '#E8DDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },

    emojiAdmin: {
        fontSize: 31,
    },

    textoBoasVindas: {
        flex: 1,
    },

    tituloBoasVindas: {
        color: '#445158',
        fontSize: 17,
        fontWeight: '700',
    },

    subtituloBoasVindas: {
        color: '#7D898E',
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },

    cardPrincipal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 11,
    },

    iconeCard: {
        width: 55,
        height: 55,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    fundoAzul: {
        backgroundColor: '#DDF3FA',
    },

    fundoRosa: {
        backgroundColor: '#F8DDE6',
    },

    emojiCard: {
        fontSize: 27,
    },

    conteudoCard: {
        flex: 1,
    },

    tituloCard: {
        color: '#46545B',
        fontSize: 13,
        fontWeight: '700',
    },

    descricaoCard: {
        color: '#7D898E',
        fontSize: 10,
        lineHeight: 14,
        marginTop: 4,
    },

    setaCard: {
        color: '#42A5D5',
        fontSize: 28,
        marginLeft: 7,
    },

    cardInformacao: {
        backgroundColor: '#FFF3C9',
        borderRadius: 19,
        padding: 15,
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: 25,
    },

    iconeInformacao: {
        fontSize: 25,
        marginRight: 10,
    },

    textoInformacao: {
        flex: 1,
    },

    tituloInformacao: {
        color: '#665B3D',
        fontSize: 12,
        fontWeight: '700',
    },

    descricaoInformacao: {
        color: '#786F56',
        fontSize: 10,
        lineHeight: 15,
        marginTop: 3,
    },

    resumo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    cardResumo: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 22,
        alignItems: 'center',
    },

    numeroResumo: {
        color: '#42A5D5',
        fontSize: 27,
        fontWeight: '700',
    },

    textoResumo: {
        color: '#7D898E',
        fontSize: 10,
        marginTop: 4,
    },

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 28,
    },

    decoracaoEmoji: {
        fontSize: 31,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },
});