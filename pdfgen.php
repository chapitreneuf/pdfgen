<?php
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
}
?>