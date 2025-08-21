<?php
require_once 'vendor/autoload.php';
use TCPDF as TCPDF;

class PDFGenerator {
    private $pdf;
    
    public function __construct() {
        // Create new PDF document
        $this->pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        
        // Set document information
        $this->pdf->SetCreator('Local Service Provider');
        $this->pdf->SetAuthor('Local Service Provider');
        $this->pdf->SetTitle('Payment Receipt');
        $this->pdf->SetSubject('Payment Receipt');
        $this->pdf->SetKeywords('Payment, Receipt, Service');
        
        // Set default header data
        $this->pdf->SetHeaderData('', 0, 'Payment Receipt', '');
        
        // Set header and footer fonts
        $this->pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
        $this->pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
        
        // Set default monospaced font
        $this->pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
        
        // Set margins
        $this->pdf->SetMargins(15, 25, 15);
        $this->pdf->SetHeaderMargin(10);
        $this->pdf->SetFooterMargin(10);
        
        // Set auto page breaks
        $this->pdf->SetAutoPageBreak(TRUE, 25);
        
        // Set image scale factor
        $this->pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);
        
        // Set default font subsetting mode
        $this->pdf->setFontSubsetting(true);
        
        // Add a page
        $this->pdf->AddPage();
    }
    
    /**
     * Generate payment slip PDF
     */
    public function generatePaymentSlip($slipData, $recipientType = 'user') {
        $isUser = $recipientType === 'user';
        $otherParty = $isUser ? $slipData['worker_name'] : $slipData['user_name'];
        $paymentDate = date('M j, Y g:i A', strtotime($slipData['payment_date']));
        
        // Set font
        $this->pdf->SetFont('helvetica', '', 12);
        
        // Title
        $this->pdf->SetFont('helvetica', 'B', 20);
        $this->pdf->Cell(0, 10, 'PAYMENT RECEIPT', 0, 1, 'C');
        $this->pdf->Ln(10);
        
        // Receipt number and date
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->Cell(0, 6, 'Receipt #: ' . $slipData['slip_number'], 0, 1, 'R');
        $this->pdf->Cell(0, 6, 'Date: ' . $paymentDate, 0, 1, 'R');
        $this->pdf->Ln(15);
        
        // From/To section
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(95, 7, 'From', 0, 0, 'L');
        $this->pdf->Cell(95, 7, 'To', 0, 1, 'L');
        
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->Cell(95, 6, 'Local Service Provider', 0, 0, 'L');
        $this->pdf->Cell(95, 6, $isUser ? $slipData['user_name'] : $slipData['worker_name'], 0, 1, 'L');
        $this->pdf->Cell(95, 6, 'support@localservice.com', 0, 1, 'L');
        $this->pdf->Ln(10);
        
        // Service details
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 10, 'Service Details', 0, 1, 'L');
        $this->pdf->SetFont('helvetica', '', 10);
        
        $this->pdf->Cell(40, 6, 'Service:', 0, 0, 'L');
        $this->pdf->Cell(0, 6, $slipData['service_name'], 0, 1, 'L');
        
        $this->pdf->Cell(40, 6, 'Description:', 0, 0, 'L');
        $this->pdf->MultiCell(0, 6, $slipData['service_description'] ?? 'N/A', 0, 'L');
        
        $this->pdf->Cell(40, 6, 'Service Date:', 0, 0, 'L');
        $this->pdf->Cell(0, 6, $slipData['service_date'] ?? 'N/A', 0, 1, 'L');
        
        $this->pdf->Ln(10);
        
        // Payment details
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 10, 'Payment Information', 0, 1, 'L');
        $this->pdf->SetFont('helvetica', '', 10);
        
        $this->pdf->Cell(60, 6, 'Payment Method:', 0, 0, 'L');
        $this->pdf->Cell(0, 6, ucfirst($slipData['payment_method']), 0, 1, 'L');
        
        if (!empty($slipData['transaction_id'])) {
            $this->pdf->Cell(60, 6, 'Transaction ID:', 0, 0, 'L');
            $this->pdf->Cell(0, 6, $slipData['transaction_id'], 0, 1, 'L');
        }
        
        $this->pdf->Ln(5);
        
        // Amount in words
        $this->pdf->Cell(0, 6, 'Amount in words:', 0, 1, 'L');
        $this->pdf->SetFont('helvetica', 'I', 10);
        $this->pdf->Cell(0, 6, $this->numberToWords($slipData['amount']) . ' Taka Only', 0, 1, 'L');
        $this->pdf->SetFont('helvetica', '', 10);
        
        $this->pdf->Ln(10);
        
        // Total amount
        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 10, 'Total Amount: Tk ' . number_format($slipData['amount'], 2), 0, 1, 'R');
        $this->pdf->Ln(15);
        
        // Footer
        $this->pdf->SetFont('helvetica', 'I', 8);
        $this->pdf->Cell(0, 5, 'This is a computer-generated receipt. No signature is required.', 0, 1, 'C');
        $this->pdf->Cell(0, 5, 'Thank you for using our services!', 0, 1, 'C');
        
        return $this->pdf->Output('payment_receipt_' . $slipData['slip_number'] . '.pdf', 'S');
    }
    
    /**
     * Convert number to words
     */
    private function numberToWords($number) {
        $decimal = round($number - ($no = floor($number)), 2) * 100;
        $hundred = null;
        $digits_length = strlen($no);
        $i = 0;
        $str = array();
        $words = array(0 => '', 1 => 'one', 2 => 'two',
            3 => 'three', 4 => 'four', 5 => 'five', 6 => 'six',
            7 => 'seven', 8 => 'eight', 9 => 'nine',
            10 => 'ten', 11 => 'eleven', 12 => 'twelve',
            13 => 'thirteen', 14 => 'fourteen', 15 => 'fifteen',
            16 => 'sixteen', 17 => 'seventeen', 18 => 'eighteen',
            19 => 'nineteen', 20 => 'twenty', 30 => 'thirty',
            40 => 'forty', 50 => 'fifty', 60 => 'sixty',
            70 => 'seventy', 80 => 'eighty', 90 => 'ninety');
        $digits = array('', 'hundred', 'thousand', 'lakh', 'crore');
        
        while ($i < $digits_length) {
            $divider = ($i == 2) ? 10 : 100;
            $number = floor($no % $divider);
            $no = floor($no / $divider);
            $i += $divider == 10 ? 1 : 2;
            if ($number) {
                $plural = (($counter = count($str)) && $number > 9) ? 's' : null;
                $hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
                $str[] = ($number < 21) ? $words[$number] . ' ' . $digits[$counter] . $plural . ' ' . $hundred : 
                    $words[floor($number / 10) * 10] . ' ' . $words[$number % 10] . ' ' . $digits[$counter] . $plural . ' ' . $hundred;
            } else $str[] = null;
        }
        
        $taka = implode('', array_reverse($str));
        $paisa = '';
        
        if ($decimal > 0) {
            $paisa = ' and ' . ($words[$decimal / 10] . ' ' . $words[$decimal % 10]) . ' paisa';
        }
        
        return ucfirst(trim($taka . $paisa));
    }
}
