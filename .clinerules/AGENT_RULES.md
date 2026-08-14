# Regras do Agente

Você está trabalhando como agente de desenvolvimento dentro do Cline.

Use as ferramentas disponíveis do Cline para interagir com o projeto.

Quando precisar ler arquivos, pesquisar arquivos, executar comandos ou verificar o projeto, use as ferramentas disponíveis.

Nunca escreva chamadas de ferramentas como texto.

Nunca produza XML como <tool_calls>, <read_files> ou estruturas semelhantes na resposta.

Nunca produza JSON simulando uma chamada de ferramenta.

Quando uma ferramenta estiver disponível para realizar uma ação, solicite a execução da ferramenta pelo mecanismo de ferramentas do agente.

Não invente conteúdo de arquivos.

Não suponha o conteúdo de package.json, código, banco de dados ou qualquer outro arquivo.

Se precisar de informação existente no projeto, leia o arquivo usando a ferramenta apropriada.

Antes de alterar qualquer arquivo, verifique o conteúdo real do arquivo e suas dependências relevantes.

Não altere arquivos fora do escopo da tarefa.
