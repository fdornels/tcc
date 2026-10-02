import { router, useLocalSearchParams } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCriancaDetalhesScreen() {
    const params = useLocalSearchParams();

    const nome = String(params.nome ?? '');
    const apelido = String(params.apelido ?? '');
    const dataNascimento = String(params.dataNascimento ?? '');
    const sexo = String(params.sexo ?? '');
    const escola = String(params.escola ?? '');
    const comunicacao = String(params.comunicacao ?? '');
    const preferencias = String(params.preferencias ?? '');
    const sensibilidades = String(params.sensibilidades ?? '');
    const observacoes = String(params.observacoes ?? '');

    function LinhaInformacao({
        icone,
        titulo,
        valor,
        ultimo = false,
    }: {
        icone: string;
        titulo: string;
        valor: string;
        ultimo?: boolean;
    }) {
        return (
            <View
                style={[
                    styles.linhaInformacao,
                    ultimo && styles.ultimaLinha,
                ]}
            >
                <View style={styles.iconeLinha}>
                    <Text style={styles.emojiLinha}>
                        {icone}
                    </Text>
                </View>

                <View style={styles.textoLinha}>
                    <Text style={styles.tituloLinha}>
                        {titulo}
                    </Text>

                    <Text style={styles.valorLinha}>
                        {valor || 'Não informado'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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
                        Detalhes da criança
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* PERFIL */}
                <View style={styles.perfil}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarEmoji}>
                            🧸
                        </Text>
                    </View>

                    <Text style={styles.nome}>
                        {nome || 'Criança'}
                    </Text>

                    {apelido ? (
                        <Text style={styles.apelido}>
                            💙 {apelido}
                        </Text>
                    ) : null}

                    <Text style={styles.identificacao}>
                        Cadastro no TEAjudo
                    </Text>
                </View>

                {/* DADOS PESSOAIS */}
                <Text style={styles.tituloSecao}>
                    Dados pessoais
                </Text>

                <View style={styles.card}>
                    <LinhaInformacao
                        icone="🎂"
                        titulo="Data de nascimento"
                        valor={dataNascimento}
                    />

                    <LinhaInformacao
                        icone="👤"
                        titulo="Sexo"
                        valor={sexo}
                    />

                    <LinhaInformacao
                        icone="🎒"
                        titulo="Escola"
                        valor={escola}
                        ultimo
                    />
                </View>

                {/* COMUNICAÇÃO */}
                <Text style={styles.tituloSecao}>
                    Comunicação
                </Text>

                <View style={styles.card}>
                    <LinhaInformacao
                        icone="💬"
                        titulo="Como se comunica"
                        valor={comunicacao}
                        ultimo
                    />
                </View>

                {/* PREFERÊNCIAS */}
                <Text style={styles.tituloSecao}>
                    Preferências e sensibilidades
                </Text>

                <View style={styles.card}>
                    <LinhaInformacao
                        icone="💙"
                        titulo="Preferências"
                        valor={preferencias}
                    />

                    <LinhaInformacao
                        icone="🧩"
                        titulo="Sensibilidades"
                        valor={sensibilidades}
                        ultimo
                    />
                </View>

                {/* OBSERVAÇÕES */}
                <Text style={styles.tituloSecao}>
                    Observações
                </Text>

                <View style={styles.cardObservacoes}>
                    <Text style={styles.emojiObservacoes}>
                        📝
                    </Text>

                    <Text style={styles.textoObservacoes}>
                        {observacoes || 'Nenhuma observação informada.'}
                    </Text>
                </View>

                {/* AVISO */}
                <View style={styles.aviso}>
                    <Text style={styles.iconeAviso}>🔒</Text>

                    <View style={styles.textoAvisoContainer}>
                        <Text style={styles.tituloAviso}>
                            Visualização administrativa
                        </Text>

                        <Text style={styles.textoAviso}>
                            As informações desta criança são exibidas
                            somente para consulta.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DDF5FC',
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

    perfil: {
        backgroundColor: '#FFFFFF',
        borderRadius: 26,
        padding: 22,
        alignItems: 'center',
        marginBottom: 22,
    },

    avatar: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: '#EAF8FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    avatarEmoji: {
        fontSize: 42,
    },

    nome: {
        fontSize: 21,
        fontWeight: '700',
        color: '#4B5A60',
        textAlign: 'center',
    },

    apelido: {
        fontSize: 13,
        color: '#5C89A0',
        marginTop: 5,
    },

    identificacao: {
        fontSize: 11,
        color: '#9AA5AA',
        marginTop: 7,
    },

    tituloSecao: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 9,
        marginLeft: 3,
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    linhaInformacao: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F4',
    },

    ultimaLinha: {
        borderBottomWidth: 0,
    },

    iconeLinha: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDF9FC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    emojiLinha: {
        fontSize: 19,
    },

    textoLinha: {
        flex: 1,
    },

    tituloLinha: {
        fontSize: 11,
        color: '#929EA3',
        marginBottom: 3,
    },

    valorLinha: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5A60',
        lineHeight: 20,
    },

    cardObservacoes: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 17,
        flexDirection: 'row',
        marginBottom: 20,
    },

    emojiObservacoes: {
        fontSize: 21,
        marginRight: 12,
    },

    textoObservacoes: {
        flex: 1,
        fontSize: 13,
        color: '#64757C',
        lineHeight: 20,
    },

    aviso: {
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },

    iconeAviso: {
        fontSize: 23,
        marginRight: 12,
    },

    textoAvisoContainer: {
        flex: 1,
    },

    tituloAviso: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4B5A60',
        marginBottom: 3,
    },

    textoAviso: {
        fontSize: 11,
        color: '#8B979C',
        lineHeight: 16,
    },
});