// The raison d'etre of this module is to keep the import statement out of sight of Webpack.

function importModule( moduleName )
{
  return import( moduleName );
}
