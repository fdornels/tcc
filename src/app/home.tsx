import { router } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.conteudo}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabeçalho */}
                <View style={styles.cabecalho}>
                    <Pressable onPress={() => router.push('/admin')}>
                        <Text style={styles.menu}>☰</Text>
                    </Pressable>

                    <View style={styles.logoArea}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoRosa}>(TE)</Text>
                            <Text style={styles.logoAzul}>AJUDO</Text>
                        </Text>

                        <Text style={styles.slogan}>
                            Apoio à maternidade atípica
                        </Text>
                    </View>

                    <Text style={styles.sino}>♧</Text>
                </View>

                {/* Boas-vindas */}
                <View style={styles.boasVindas}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarEmoji}>👩🏻</Text>
                    </View>

                    <View style={styles.boasVindasTexto}>
                        <Text style={styles.ola}>Olá, Fernanda!</Text>
                        <Text style={styles.mensagem}>
                            Que bom te ver por aqui! 💙
                        </Text>
                    </View>
                </View>

                <Text style={styles.tituloSecao}>Sua rotina rápida</Text>

                {/* Cards */}
                <View style={styles.grade}>
                    <Pressable
                        style={[styles.card, styles.cardAmarelo]}
                        onPress={() => router.push('/agenda')}
                    >
                        <Text style={styles.icone}>🗓️</Text>
                        <Text style={styles.cardTitulo}>Agenda</Text>
                        <Text style={styles.cardDescricao}>
                            Veja seus compromissos
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.card, styles.cardVerde]}
                        onPress={() => router.push('/orientacoes')}
                    >
                        <Text style={styles.icone}>🧩</Text>
                        <Text style={styles.cardTitulo}>Orientações</Text>
                        <Text style={styles.cardDescricao}>
                            Acesse conteúdos sobre o TEA
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.card, styles.cardRoxo]}
                        onPress={() => router.push('/atividades')}
                    >
                        <Text style={styles.icone}>✏️</Text>
                        <Text style={styles.cardTitulo}>Atividades</Text>
                        <Text style={styles.cardDescricao}>
                            Registre e acompanhe as atividades
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.card, styles.cardRosa]}
                        onPress={() => router.push('/crianca')}
                    >
                        <Text style={styles.icone}>👧🏻</Text>
                        <Text style={styles.cardTitulo}>Minha Criança</Text>
                        <Text style={styles.cardDescricao}>
                            Gerencie as informações
                        </Text>
                    </Pressable>
                </View>

                {/* Decoração provisória */}
                <View style={styles.decoracao}>
                    <Text style={styles.decoracaoEmoji}>🌈</Text>
                    <Text style={styles.infinito}>∞</Text>
                    <Text style={styles.decoracaoEmoji}>🧩</Text>
                </View>
            </ScrollView>

            {/* Navegação inferior */}
            <View style={styles.menuInferior}>
                <Pressable style={styles.itemMenu}>
                    <Text style={styles.menuIconeAtivo}>⌂</Text>
                    <Text style={styles.menuTextoAtivo}>Início</Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/agenda')}
                >
                    <Text style={styles.menuIcone}>▣</Text>
                    <Text style={styles.menuTexto}>Agenda</Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/atividades')}
                >
                    <Text style={styles.menuIcone}>✎</Text>
                    <Text style={styles.menuTexto}>Atividades</Text>
                </Pressable>

                <Pressable
                    style={styles.itemMenu}
                    onPress={() => router.push('/orientacoes')}
                >
                    <Text style={styles.menuIcone}>♧</Text>
                    <Text style={styles.menuTexto}>Orientações</Text>
                </Pressable>
            </View>
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
        paddingBottom: 115,
    },

    cabecalho: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 25,
    },

    menu: {
        fontSize: 24,
        color: '#427DA1',
    },

    sino: {
        fontSize: 24,
        color: '#427DA1',
    },

    logoArea: {
        alignItems: 'center',
    },

    logo: {
        fontSize: 25,
        fontWeight: '800',
    },

    logoRosa: {
        color: '#FF7FA3',
    },

    logoAzul: {
        color: '#42A5D5',
    },

    slogan: {
        color: '#7A858B',
        fontSize: 9,
        marginTop: 2,
    },

    boasVindas: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    avatarEmoji: {
        fontSize: 43,
    },

    boasVindasTexto: {
        flex: 1,
    },

    ola: {
        color: '#3E4850',
        fontSize: 20,
        fontWeight: '700',
    },

    mensagem: {
        color: '#68747A',
        fontSize: 13,
        marginTop: 5,
    },

    tituloSecao: {
        color: '#48545A',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },

    grade: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    card: {
        width: '48%',
        minHeight: 145,
        borderRadius: 20,
        padding: 15,
        marginBottom: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },

    cardAmarelo: {
        backgroundColor: '#FFF1C9',
    },

    cardVerde: {
        backgroundColor: '#DDF1D6',
    },

    cardRoxo: {
        backgroundColor: '#E8DDF5',
    },

    cardRosa: {
        backgroundColor: '#F8DDE6',
    },

    icone: {
        fontSize: 35,
        marginBottom: 8,
    },

    cardTitulo: {
        color: '#445158',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },

    cardDescricao: {
        color: '#68747A',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 5,
        lineHeight: 14,
    },

    decoracao: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 15,
    },

    decoracaoEmoji: {
        fontSize: 43,
    },

    infinito: {
        color: '#72CDA2',
        fontSize: 55,
        fontWeight: '700',
    },

    menuInferior: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },

    itemMenu: {
        flex: 1,
        alignItems: 'center',
    },

    menuIcone: {
        color: '#8B979C',
        fontSize: 22,
    },

    menuIconeAtivo: {
        color: '#42A5D5',
        fontSize: 24,
        fontWeight: '700',
    },

    menuTexto: {
        color: '#8B979C',
        fontSize: 9,
        marginTop: 4,
    },

    menuTextoAtivo: {
        color: '#42A5D5',
        fontSize: 9,
        fontWeight: '700',
        marginTop: 4,
    },
});