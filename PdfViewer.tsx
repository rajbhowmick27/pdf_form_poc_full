import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCw,
  Maximize,
  Minimize
} from 'lucide-react';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'document.pdf';
    link.click();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  return (
    <div className={`pdf-viewer-container ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="pdf-toolbar bg-dark text-white py-2 px-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-12 col-md-4 d-flex align-items-center justify-content-start mb-2 mb-md-0">
              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="d-flex align-items-center me-2">
                <input
                  type="number"
                  className="form-control form-control-sm page-input"
                  value={pageNumber}
                  onChange={handlePageInputChange}
                  min={1}
                  max={numPages}
                  style={{ width: '60px' }}
                />
                <span className="ms-2 text-nowrap">of {numPages}</span>
              </div>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="col-12 col-md-4 d-flex align-items-center justify-content-center mb-2 mb-md-0">
              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={zoomOut}
                disabled={scale <= 0.5}
                title="Zoom out"
              >
                <ZoomOut size={18} />
              </button>

              <span className="zoom-level mx-2">{Math.round(scale * 100)}%</span>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={zoomIn}
                disabled={scale >= 3.0}
                title="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            <div className="col-12 col-md-4 d-flex align-items-center justify-content-end">
              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={rotate}
                title="Rotate"
              >
                <RotateCw size={18} />
              </button>

              <button
                className="btn btn-sm btn-outline-light me-2"
                onClick={handleDownload}
                title="Download"
              >
                <Download size={18} />
              </button>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pdf-content">
        {loading && (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading PDF...</span>
              </div>
            </div>
          }
          error={
            <div className="alert alert-danger m-4" role="alert">
              Failed to load PDF. Please check the URL and try again.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
