import { router, useLocalSearchParams } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrientacaoDetalhada = {
    id: string;
    titulo: string;
    categoria: string;
    icone: string;
    introducao: string;
    dicas: string[];
    lembrete: string;
};

const orientacoes: OrientacaoDetalhada[] = [
    {
        id: '1',
        titulo: 'Como agir em uma crise sensorial',
        categoria: 'Crise Sensorial',
        icone: '🧩',
        introducao:
            'Momentos de sobrecarga sensorial podem acontecer quando a criança recebe mais estímulos do que consegue processar naquele momento.',
        dicas: [
            'Procure reduzir estímulos como barulho, luz intensa e movimentação ao redor.',
            'Mantenha uma postura calma e evite exigir respostas imediatas.',
            'Se possível, ofereça um ambiente mais tranquilo e conhecido.',
            'Observe quais estratégias costumam ajudar a criança a se reorganizar.',
        ],
        lembrete:
            'Cada criança é única. Observe suas necessidades e respeite seu tempo.',
    },
    {
        id: '2',
        titulo: 'Identificando sinais de sobrecarga',
        categoria: 'Crise Sensorial',
        icone: '💙',
        introducao:
            'Reconhecer sinais de desconforto pode ajudar o responsável a agir antes que a situação se torne mais difícil.',
        dicas: [
            'Observe mudanças repentinas no comportamento.',
            'Perceba se determinados sons, luzes, cheiros ou ambientes causam desconforto.',
            'Registre situações recorrentes para identificar possíveis padrões.',
            'Considere as formas individuais que a criança utiliza para demonstrar desconforto.',
        ],
        lembrete:
            'Os sinais podem variar bastante de uma criança para outra.',
    },
    {
        id: '3',
        titulo: 'Criando um ambiente mais tranquilo',
        categoria: 'Crise Sensorial',
        icone: '☁️',
        introducao:
            'Algumas adaptações no ambiente podem contribuir para reduzir estímulos e proporcionar maior conforto.',
        dicas: [
            'Evite excesso de estímulos simultâneos quando possível.',
            'Organize um espaço tranquilo para momentos de descanso.',
            'Observe a iluminação e os sons presentes no ambiente.',
            'Mantenha objetos familiares por perto quando eles ajudarem a criança.',
        ],
        lembrete:
            'O objetivo não é eliminar todos os estímulos, mas compreender quais adaptações ajudam.',
    },

    {
        id: '4',
        titulo: 'Incentivando a comunicação',
        categoria: 'Comunicação',
        icone: '💬',
        introducao:
            'A comunicação pode acontecer de diferentes maneiras. O importante é reconhecer e valorizar as formas que a criança utiliza para se expressar.',
        dicas: [
            'Use frases claras e objetivas.',
            'Dê tempo para que a criança processe a informação.',
            'Observe gestos, expressões e outras formas de comunicação.',
            'Valorize as tentativas de comunicação sem pressionar.',
        ],
        lembrete:
            'Comunicação não se limita à fala. Diferentes formas de expressão podem ter significado.',
    },
    {
        id: '5',
        titulo: 'Comunicação além da fala',
        categoria: 'Comunicação',
        icone: '🗨️',
        introducao:
            'Gestos, imagens, expressões e recursos de comunicação podem auxiliar a criança a demonstrar necessidades, interesses e sentimentos.',
        dicas: [
            'Observe os gestos e expressões utilizados pela criança.',
            'Utilize recursos visuais quando forem úteis.',
            'Associe palavras a situações e objetos do cotidiano.',
            'Respeite a forma de comunicação utilizada pela criança.',
        ],
        lembrete:
            'O apoio à comunicação deve considerar as necessidades individuais.',
    },
    {
        id: '6',
        titulo: 'Dando tempo para responder',
        categoria: 'Comunicação',
        icone: '⏳',
        introducao:
            'Algumas crianças podem precisar de mais tempo para compreender uma pergunta ou organizar uma resposta.',
        dicas: [
            'Faça uma pergunta de cada vez.',
            'Espere alguns segundos antes de repetir a pergunta.',
            'Evite completar imediatamente a resposta pela criança.',
            'Mantenha instruções simples e claras.',
        ],
        lembrete:
            'Dar tempo para responder também é uma forma de respeitar a comunicação.',
    },

    {
        id: '7',
        titulo: 'Criando uma rotina previsível',
        categoria: 'Rotinas',
        icone: '🌈',
        introducao:
            'Uma rotina mais previsível pode ajudar a criança a compreender o que acontecerá ao longo do dia.',
        dicas: [
            'Organize os principais momentos do dia em uma sequência.',
            'Avise quando uma atividade estiver próxima de terminar.',
            'Utilize imagens ou outros recursos visuais quando forem úteis.',
            'Mantenha alguma flexibilidade para situações inesperadas.',
        ],
        lembrete:
            'A rotina pode oferecer previsibilidade sem precisar ser completamente rígida.',
    },
    {
        id: '8',
        titulo: 'Preparando para mudanças',
        categoria: 'Rotinas',
        icone: '📅',
        introducao:
            'Mudanças podem ser mais fáceis de compreender quando são comunicadas com antecedência e de forma clara.',
        dicas: [
            'Avise sobre mudanças assim que possível.',
            'Explique de maneira simples o que será diferente.',
            'Mostre o que continuará igual.',
            'Use recursos visuais para representar a mudança quando necessário.',
        ],
        lembrete:
            'Antecipar uma mudança pode ajudar a tornar a situação mais previsível.',
    },
    {
        id: '9',
        titulo: 'Rotina visual',
        categoria: 'Rotinas',
        icone: '🖼️',
        introducao:
            'Recursos visuais podem ajudar a representar atividades e facilitar a compreensão da sequência do dia.',
        dicas: [
            'Use imagens simples para representar as atividades.',
            'Organize as imagens na ordem em que as atividades acontecerão.',
            'Mostre quando uma atividade for concluída.',
            'Atualize a rotina quando houver alguma mudança.',
        ],
        lembrete:
            'O recurso visual deve ser simples e adequado à compreensão da criança.',
    },

    {
        id: '10',
        titulo: 'Conhecendo os direitos',
        categoria: 'Direitos',
        icone: '⚖️',
        introducao:
            'Conhecer os direitos relacionados às pessoas com Transtorno do Espectro Autista pode ajudar famílias a buscar informações e serviços adequados.',
        dicas: [
            'Procure informações em fontes oficiais e atualizadas.',
            'Guarde documentos importantes relacionados aos atendimentos.',
            'Em caso de dúvida, procure o órgão responsável pelo serviço.',
            'Busque orientação especializada quando a situação exigir.',
        ],
        lembrete:
            'Leis, procedimentos e benefícios podem ter regras específicas. Consulte sempre fontes oficiais.',
    },
    {
        id: '11',
        titulo: 'Inclusão no ambiente escolar',
        categoria: 'Direitos',
        icone: '🎒',
        introducao:
            'A inclusão escolar envolve participação, aprendizagem, acessibilidade e respeito às necessidades do estudante.',
        dicas: [
            'Mantenha comunicação com a equipe escolar.',
            'Compartilhe informações relevantes para o acompanhamento da criança.',
            'Converse sobre estratégias que favoreçam participação e aprendizagem.',
            'Registre dúvidas e procure informações oficiais quando necessário.',
        ],
        lembrete:
            'As necessidades educacionais devem ser analisadas considerando cada estudante e seu contexto.',
    },
    {
        id: '12',
        titulo: 'Atendimento prioritário',
        categoria: 'Direitos',
        icone: '⭐',
        introducao:
            'Existem normas relacionadas ao atendimento prioritário, e conhecer essas informações pode ajudar no acesso aos serviços.',
        dicas: [
            'Consulte as regras do local ou serviço utilizado.',
            'Procure informações em canais oficiais.',
            'Tenha documentos necessários disponíveis quando forem exigidos.',
            'Em caso de dúvida, solicite orientação ao responsável pelo atendimento.',
        ],
        lembrete:
            'Os procedimentos podem variar conforme o serviço. Confirme as regras aplicáveis em fontes oficiais.',
    },
];

export default function OrientacaoDetalhesScreen() {
    const params = useLocalSearchParams();

    const idParametro = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const orientacao = orientacoes.find(
        (item) => item.id === idParametro
    );

    if (!orientacao) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.erroContainer}>
                    <Text style={styles.erroEmoji}>📚</Text>

                    <Text style={styles.erroTitulo}>
                        Orientação não encontrada
                    </Text>

                    <Pressable
                        style={styles.botaoVoltarErro}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.textoBotaoVoltar}>
                            Voltar
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
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
                        Orientação
                    </Text>

                    <Text style={styles.estrela}>★</Text>
                </View>

                {/* Apresentação */}
                <View style={styles.apresentacao}>
                    <View style={styles.iconePrincipal}>
                        <Text style={styles.emojiPrincipal}>
                            {orientacao.icone}
                        </Text>
                    </View>

                    <Text style={styles.categoria}>
                        {orientacao.categoria}
                    </Text>

                    <Text style={styles.titulo}>
                        {orientacao.titulo}
                    </Text>
                </View>

                {/* Conteúdo */}
                <View style={styles.card}>
                    <Text style={styles.tituloSecao}>
                        💙 Entenda
                    </Text>

                    <Text style={styles.paragrafo}>
                        {orientacao.introducao}
                    </Text>

                    <View style={styles.divisor} />

                    <Text style={styles.tituloSecao}>
                        🌈 O que pode ajudar?
                    </Text>

                    {orientacao.dicas.map((dica, index) => (
                        <View
                            key={index}
                            style={styles.itemDica}
                        >
                            <View style={styles.numero}>
                                <Text style={styles.numeroTexto}>
                                    {index + 1}
                                </Text>
                            </View>

                            <Text style={styles.textoDica}>
                                {dica}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.lembrete}>
                        <Text style={styles.iconeLembrete}>
                            ⭐
                        </Text>

                        <View style={styles.textoLembreteContainer}>
                            <Text style={styles.tituloLembrete}>
                                Lembre-se
                            </Text>

                            <Text style={styles.textoLembrete}>
                                {orientacao.lembrete}
                            </Text>
                        </View>
                    </View>
                </View>

                <Pressable
                    style={styles.botaoFinal}
                    onPress={() => router.back()}
                >
                    <Text style={styles.textoBotaoFinal}>
                        Voltar às orientações
                    </Text>
                </Pressable>

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

    tituloCabecalho: {
        color: '#40515A',
        fontSize: 19,
        fontWeight: '700',
    },

    estrela: {
        color: '#FFD447',
        fontSize: 29,
    },

    apresentacao: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 15,
    },

    iconePrincipal: {
        width: 78,
        height: 78,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },

    emojiPrincipal: {
        fontSize: 40,
    },

    categoria: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
    },

    titulo: {
        color: '#40515A',
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '700',
        textAlign: 'center',
    },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 20,
    },

    tituloSecao: {
        color: '#445158',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },

    paragrafo: {
        color: '#66757B',
        fontSize: 13,
        lineHeight: 21,
    },

    divisor: {
        height: 1,
        backgroundColor: '#E7EFF2',
        marginVertical: 20,
    },

    itemDica: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },

    numero: {
        width: 27,
        height: 27,
        borderRadius: 14,
        backgroundColor: '#DDF3FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    numeroTexto: {
        color: '#42A5D5',
        fontSize: 11,
        fontWeight: '700',
    },

    textoDica: {
        flex: 1,
        color: '#66757B',
        fontSize: 12,
        lineHeight: 19,
    },

    lembrete: {
        flexDirection: 'row',
        backgroundColor: '#FFF3C9',
        borderRadius: 17,
        padding: 14,
        marginTop: 8,
    },

    iconeLembrete: {
        fontSize: 24,
        marginRight: 10,
    },

    textoLembreteContainer: {
        flex: 1,
    },

    tituloLembrete: {
        color: '#665B3D',
        fontSize: 13,
        fontWeight: '700',
    },

    textoLembrete: {
        color: '#786F56',
        fontSize: 11,
        lineHeight: 17,
        marginTop: 3,
    },

    botaoFinal: {
        height: 52,
        backgroundColor: '#FF7FA3',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
    },

    textoBotaoFinal: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },

    decoracao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 20,
    },

    decoracaoEmoji: {
        fontSize: 30,
    },

    coracao: {
        color: '#FF8FB1',
        fontSize: 30,
    },

    erroContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },

    erroEmoji: {
        fontSize: 50,
    },

    erroTitulo: {
        color: '#40515A',
        fontSize: 18,
        fontWeight: '700',
        marginTop: 15,
    },

    botaoVoltarErro: {
        backgroundColor: '#FF7FA3',
        borderRadius: 15,
        paddingHorizontal: 30,
        paddingVertical: 13,
        marginTop: 20,
    },

    textoBotaoVoltar: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});