<?php 


class Language{

	private static $data = [];
	private static $defaultData = [];
	private static $defaultLanguage = "English";
	private static $currentLanguage = null;

	/**
	 * INIT the Language System
	 * @param string $language [language used]
	 * @param string $folder   [folder with all the languages]
	 */
	public function __construct($language = "English",$folder = "lang"){
		Language::$currentLanguage = $language;

		// get file data
		$defaultFile = $folder."/".self::$defaultLanguage.".json";
		$file = $folder."/".$language.".json";

		if(file_exists( $defaultFile ))
			self::$defaultData = json_decode( file_get_contents($defaultFile) ,true);

		if(file_exists( $file ))
			self::$data = json_decode( file_get_contents($file) ,true);
	}

	/**
	 * Parses and returns the language data 
	 * @param  [string] $data [language reference EG: "array.index"]
	 * @return [string]       [parsed language var]
	 */
	public static function get($data){
		$keys 	= explode(".", $data);
		$lang 	= self::$data;
		$error  = false;
		
		// remove last element if there is a '.' character (some bad regex there selected that)
		if(end($keys) == '.')
			array_pop($keys);

		foreach ($keys as $value) {
			if(!isset( $lang[$value]) ){ $error = true ; break;}
			$lang = $lang[$value];
		}

		// current language does not have the translation. 
		// check it in the default language only if the 2 languages are not the same
		// to prevent double checking
		
		if($error){
			$lang = self::$defaultData;	
			foreach ($keys as $value) {
				if(!$lang[$value]) return implode(" ",$keys);
				$lang = $lang[$value];
			}
		}

		return $lang;
	}
}

/**
 * Aliases for Language::get($data) function
 * @param [string] $data [returns a parsed language variable]
 */
function Lang($data){
	return Language::get($data);
}

/**
 * Aliases for Language::get($data) function
 * @param [string] $data [returns a parsed language variable]
 */
function L($data){
	return Language::get($data);
}

/**
 * Language pattern
 */
SS::pattern('language',function($snippet,$data){
	$regex = '/@([a-zA-Z][\w\.]+)(?: *?\[([\@\,\w\. ]*?)\])?/i';

	preg_match_all($regex, $snippet,$matches);

	foreach ($matches[1] as $key => $match) {
		// check if it is a simple language var ( eg: @user.name )
		if($matches[2][$key] == ""){
			$snippet = str_replace($matches[0][$key], Lang($match), $snippet);
			continue;
		}
		// else is a complex language var ( eg: @requires[@buildings.$buildName,$level] )
		
		/**
		 * process anything is in between brackets
		 */
		// get language string
		$string = Lang($match);

		// get data between brackets
		$brackets = explode(',',$matches[2][$key]);

		// get all string params
		$regex = '/\$[a-zA-Z]\w*/i';
		preg_match_all($regex, $string,$params);

		// replace every variable with it's data
		foreach ($params[0] as $k => $value) {
			// check if the param is another lang var
			if($brackets[$k][0] == "@"){
				$string = str_replace($value, Lang(substr($brackets[$k],1)), $string);
				continue;
			}

			// else is a string value so replace it normally
			$string = str_replace($value,$brackets[$k], $string);
		}
		$snippet = str_replace($matches[0][$key], $string, $snippet);

	}

	return $snippet;
})


?>