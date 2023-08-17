import { Box, Fab, Modal, ModalProps, Typography } from '@mui/material';
import FullHeightScrollableContainer from './scrollableContainer';
import { ArrowBack, Favorite } from '@mui/icons-material';

// TODO may replace the short menu in the payform someday
const ProductModal: React.FC<{
    open: boolean,
    setBasketOpen: (b: boolean) => void,
}> = ({open, setBasketOpen}) => {
    return (
        <Modal
            open={open}
            onClose={() => setBasketOpen(false)}
            hideBackdrop
        >
            <FullHeightScrollableContainer sx={{
                flexGrow: 1,
                background: theme => theme.palette.background.default,
                height: '100%',
                position: 'relative',
            }}>
                <>
                    <Fab sx={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                    }}>
                        <ArrowBack />
                    </Fab>
                    <Fab sx={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                    }}>
                        <Favorite />
                    </Fab>
                </>
            </FullHeightScrollableContainer>
        </Modal>
    );
};

export default ProductModal;