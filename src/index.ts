import program from './program';
import { addOptions, pkg, registerCommands, registerPlugins } from './utils';

export * from './types';

(async () => { 
  const p = pkg(true);

  program
    .name(p.name)
    .description(p.description)
    .version(p.version);

  addOptions(program, [
    {
      name: 'plugins',
      alias: 'P',
      description: 'A directory of workspace-specific plugins',
      required: false,
      parameters: [
        {
          name: 'directory',
          description: 'A directory containing workspace-specific plugins',
          required: true,
        }
      ]
    },
  ]);

  registerCommands('./commands', true);
  
  registerPlugins(['plugins', 'P']);

  await program.parseAsync(process.argv);
})();
