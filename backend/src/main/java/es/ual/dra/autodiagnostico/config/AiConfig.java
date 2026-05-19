package es.ual.dra.autodiagnostico.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Construye un {@link ChatClient} (Gemini, Google AI Studio) con las
 * herramientas que vienen del servidor MCP remoto. El
 * {@link ToolCallbackProvider} lo autoconfigura el starter
 * spring-ai-starter-mcp-client-webflux a partir de la conexión SSE declarada
 * en application.properties.
 *
 * <p>El bean concreto del modelo (GoogleGenAiChatModel) lo crea automáticamente
 * el starter spring-ai-starter-model-google-genai a partir de
 * spring.ai.google.genai.api-key. Aquí solo construimos el ChatClient encima.
 */
@Configuration
public class AiConfig {

    @Bean
    public ChatClient diagnosisChatClient(ChatClient.Builder builder,
                                          ToolCallbackProvider mcpToolCallbackProvider) {
        return builder
                .defaultToolCallbacks(mcpToolCallbackProvider)
                .build();
    }
}
