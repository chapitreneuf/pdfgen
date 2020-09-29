<?php

require_once 'share/plugins/custom/pdfgen/vendor/autoload.php';

use TheCodingMachine\Gotenberg\Client;
use TheCodingMachine\Gotenberg\ClientException;
use TheCodingMachine\Gotenberg\DocumentFactory;
use TheCodingMachine\Gotenberg\HTMLRequest;
use TheCodingMachine\Gotenberg\URLRequest;
use TheCodingMachine\Gotenberg\Request;
use TheCodingMachine\Gotenberg\RequestException;
use GuzzleHttp\Psr7\LazyOpenStream;

class pdfgen extends Plugins {
	public function enableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function disableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function preview (&$context)	{
		if ($context['view']['tpl'] != 'pdfgen') return;
		C::set('view.base_rep.pdfgen', 'pdfgen');

		// Plugin options
		$pdf_sitelogo = $this->_config['pdf_sitelogo']['value'];
		C::set('pdf_sitelogo', $pdf_sitelogo);
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('pdfgen');
		return "_ajax";
	}

	public function getAction (&$context, &$error) {
		setlocale(LC_ALL, 'C');

		$document = $context['document'];
		$lang = isset($context['lang']) ? $context['lang'] : "";
		$cache_path = getcwd() . DIRECTORY_SEPARATOR . 'CACHE';

		if ( ! is_dir($cache_path) ) {
			mkdir($cache_path, 0755, TRUE);
                }
		$article_url = "${context['siteurl']}/?do=_pdfgen_view&document=${document}&lang=${lang}";

		$cache_key = md5($article_url);
                $cache_file = $cache_path . DIRECTORY_SEPARATOR . $cache_key;

		if ( ! file_exists( $cache_file ) || filemtime( $cache_file ) < time()) {

			$client = new Client($this->_config['gotenberg_url']['value']);
			$request = new URLRequest($article_url);

			$request->setPaperSize(Request::A4);
			$request->setMargins(Request::NO_MARGINS);

			$client->store($request, $cache_file);
			$client->post($request);

		}

		header('Content-Type: application/pdf');
		header('Content-Disposition: attachment; filename="downloaded.pdf"');
		echo file_get_contents($cache_file);

		return "_ajax";
	}

}
?>
