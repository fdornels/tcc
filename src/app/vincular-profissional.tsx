import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VincularProfissional() {
    const [codigo, setCodigo] = useState('');
const [gerando, setGerando] = useState(false);
async function gerarCodigo() {
    if (gerando) return;

    try {
        setGerando(true);

        const usuario = auth.currentUser;

        if (!usuario) {
            alert('Você precisa estar conectada.');
            return;
        }

        const token = await usuario.getIdToken();

        const resposta = await fetch(
            'https://teajudo-api.onrender.com/vinculos/gerar-codigo',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao gerar código.');
        }

        setCodigo(dados.codigo);
    } catch (erro: any) {
        alert(erro.message || 'Não foi possível gerar o código.');
    } finally {
        setGerando(false);
    }
}
    return (
        <SafeAreaView style={styles.container}>
            <Ionicons
                name="people-outline"
                size={48}
                color="#42A5D5"
            />

            <Text style={styles.titulo}>
                Vincular profissional
            </Text>

            <Text style={styles.descricao}>
                Aqui você poderá gerar um código para
                vincular um profissional à criança.
            </Text>
            <Pressable
    style={styles.botaoGerar}
    onPress={gerarCodigo}
    disabled={gerando}
>
    <Text style={styles.textoBotao}>
        {gerando ? 'Gerando...' : 'Gerar código'}
    </Text>
</Pressable>

{codigo !== '' && (
    <View style={styles.cardCodigo}>
        <Text style={styles.labelCodigo}>
            Seu código de vinculação
        </Text>

        <Text style={styles.codigo}>
            {codigo}
        </Text>

        <Text style={styles.validade}>
            Válido por 15 minutos
        </Text>
    </View>
)}

            <Text
                style={styles.voltar}
                onPress={() => router.back()}
            >
                Voltar
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    botaoGerar: {
    backgroundColor: '#42A5D5',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginTop: 25,
},

textoBotao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
},

cardCodigo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
},

labelCodigo: {
    fontSize: 12,
    color: '#8196A3',
},

codigo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#30475D',
    letterSpacing: 3,
    marginTop: 12,
},

validade: {
    fontSize: 11,
    color: '#E46B98',
    marginTop: 10,
},
    container: {
        flex: 1,
        backgroundColor: '#F9FCFD',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
    },
    titulo: {
        fontSize: 22,
        fontWeight: '700',
        color: '#30475D',
        marginTop: 20,
    },
    descricao: {
        fontSize: 13,
        color: '#8196A3',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 21,
    },
    voltar: {
        color: '#E46B98',
        fontWeight: '700',
        marginTop: 30,
    },
});