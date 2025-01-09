<?php

require_once C::get('sharedir', 'cfg') . DIRECTORY_SEPARATOR . 'plugins/custom/pdfgen/vendor/autoload.php';

use TheCodingMachine\Gotenberg\Client;
use TheCodingMachine\Gotenberg\ClientException;
use TheCodingMachine\Gotenberg\DocumentFactory;
use TheCodingMachine\Gotenberg\HTMLRequest;
use TheCodingMachine\Gotenberg\URLRequest;
use TheCodingMachine\Gotenberg\MergeRequest;
use TheCodingMachine\Gotenberg\Request;
use TheCodingMachine\Gotenberg\RequestException;
use GuzzleHttp\Psr7\LazyOpenStream;

class pdfgen extends Plugins {

	public function __construct(...$args) {
		parent::__construct(...$args);

		$this->waitDelay = 5;
		$this->waitTimeout = 30;
		$this->cache_path = getcwd() . DIRECTORY_SEPARATOR . 'CACHE';
		if ( ! is_dir($this->cache_path) ) {
			mkdir($this->cache_path, 0755, TRUE);
		}
	}

	public function enableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function disableAction (&$context, &$error) {
		if(!parent::_checkRights(LEVEL_ADMINLODEL)) { return; }
	}

	public function preview (&$context)	{
		$gotenberg_url = isset($this->_config['gotenberg_url']['value']) ? $this->_config['gotenberg_url']['value'] : false;
		$facsimile_cover_enabled = isset($this->_config['facsimile_cover_enabled']['value']) ? $this->_config['facsimile_cover_enabled']['value'] : false;
		if ($gotenberg_url) {
			// Set [#PDFGEN_URL] if pdfgen is ready
			C::set('pdfgen_url', "${context['siteurl']}/?do=_pdfgen_get&document=${context['id']}&lang=${context['sitelang']}");

			// Set [#PDFGEN_FACSIMILE_URL]
			if ($facsimile_cover_enabled) {
				C::set('pdfgen_facsimile_url', "${context['siteurl']}/?do=_pdfgen_getcoveredfacsimile&document=${context['id']}&lang=${context['sitelang']}");
			}
		}

		if ($context['view']['tpl'] != 'pdfgen') return;
		C::set('view.base_rep.pdfgen', 'pdfgen');
	}

	public function viewAction (&$context, &$error) {
		View::getView()->renderCached('pdfgen');
		return "_ajax";
	}

	public function getCoveredFacsimileAction (&$context, &$error) {

                global $db;
		setlocale(LC_ALL, 'C');

		// Configuration de Gotenberg
		$waitDelay = 5;
		$waitTimeout = 30;

		$site_name = $context['siteinfos']['name'];

		$lang = isset($context['lang']) ? $context['lang'] : "";
		$debug = isset($context['debug']) ? $context['debug'] : "";
		$id = $context['document'];

		$document = DAO::getDAO("entities")->getById($id);

		$entity = $db->getRow(lq("SELECT identity, alterfichier FROM textes WHERE identity = {$document->id}"));
		$facsimile_path = $entity['alterfichier'];

		$cover_url = "${context['siteurl']}/?do=_pdfgen_view&document=${id}&lang=${lang}&debug=${debug}&variant=frontpage";
		$cover_cache_file = $this->cache_path . DIRECTORY_SEPARATOR . md5($cover_url);
		$covered_cache_file = $this->cache_path . DIRECTORY_SEPARATOR . md5($cover_cache_file . $facsimile_path);

		$cache_disabled = isset($this->_config['cache_disabled']['value']) ? $this->_config['cache_disabled']['value'] : false;
		$clearcache = $cache_disabled || (C::get('editor', 'lodeluser') && isset($context['clearcache'])) ? true : false;
                $clearcache = $clearcache
                        || ! file_exists( $covered_cache_file )
                        || filemtime( $covered_cache_file ) < strtotime($document->upd);

		if ( $clearcache ) {
			if ( ! is_file($facsimile_path) ) {
				trigger_error("ERROR: document has no facsimile", E_USER_ERROR);
				return "_back";
			}

			$cover_url = "${context['siteurl']}/?do=_pdfgen_view&document=${id}&lang=${lang}&debug=${debug}&variant=frontpage";
			$this->get_url_pdf_to_cache($cover_url, $cover_cache_file);

			$client = new Client($this->_config['gotenberg_url']['value']);
			$files = [
			    DocumentFactory::makeFromPath('cover.pdf', $cover_cache_file),
			    DocumentFactory::makeFromPath('facsimile.pdf', $facsimile_path),
			];

			$request = new MergeRequest($files);
			$client->store($request, $covered_cache_file);
		}


		header('Content-Type: application/pdf');
		header("Content-Disposition: attachment; filename=${site_name}-${id}.pdf");
		echo file_get_contents($covered_cache_file);

		return "_ajax";
	}

	public function getAction (&$context, &$error) {

                global $db;
		setlocale(LC_ALL, 'C');

		$site_name = $context['siteinfos']['name'];

		$lang = isset($context['lang']) ? $context['lang'] : "";
		$debug = isset($context['debug']) ? $context['debug'] : "";
		$id = $context['document'];

		$document = DAO::getDAO("entities")->getById($id);

		$last_child = $db->getRow(lq("SELECT id, upd FROM entities INNER JOIN relations ON relations.id2 = entities.id WHERE relations.id1 = {$document->id} ORDER BY upd DESC"));

		$cache_disabled = isset($this->_config['cache_disabled']['value']) ? $this->_config['cache_disabled']['value'] : false;
		$clearcache = $cache_disabled || (C::get('editor', 'lodeluser') && isset($context['clearcache'])) ? true : false;

		$article_url = "${context['siteurl']}/?do=_pdfgen_view&document=${id}&lang=${lang}&debug=${debug}";

		$cache_key = md5($article_url);
		$cache_file = $this->cache_path . DIRECTORY_SEPARATOR . $cache_key;

		$clearcache = $clearcache
			|| ! file_exists( $cache_file )
			|| filemtime( $cache_file ) < strtotime($document->upd)
			|| sizeof($last_child) > 0 && filemtime( $cache_file ) < strtotime($last_child['upd']);

		if ( $clearcache ) {
			$this->get_url_pdf_to_cache($article_url, $cache_file);
		}

		header('Content-Type: application/pdf');
		header("Content-Disposition: attachment; filename=${site_name}-${id}.pdf");
		echo file_get_contents($cache_file);

		return "_ajax";
	}

	public function get_url_pdf_to_cache($url, $cache_file) {
		$client = new Client($this->_config['gotenberg_url']['value']);
		$request = new URLRequest($url);

		$request->setWaitDelay($this->waitDelay);
		$request->setWaitTimeout($this->waitTimeout);

		$request->setPaperSize(Request::A4);
		$request->setMargins(Request::NO_MARGINS);

		$client->store($request, $cache_file);
		$client->post($request);

		return $cache_file;
	}

}
?>
