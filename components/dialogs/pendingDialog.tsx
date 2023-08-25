import { Box, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { imageLoader } from '../../pages/_app';

// TODO add errors when fields are empty
export const PendingDialog: React.FC<{
  open: boolean,
  onClose: () => void,
  setPendingProductDialogOpen: Dispatch<SetStateAction<boolean>>,
  setPendingIngredientDialogOpen: Dispatch<SetStateAction<boolean>>
}> = ({ open, onClose, setPendingProductDialogOpen, setPendingIngredientDialogOpen }) => {
    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>
                    Que voulez-vous ajouter ?
                </DialogTitle>
                <DialogContent>
                    <Stack direction="column" justifyContent={'center'} alignContent={'stretch'}>
                        <Box onClick={ () => { setPendingProductDialogOpen(true); onClose(); }} sx={{
                            height: '192px',
                            border: theme => theme.palette.mode === 'light' ? `1px solid hsla(0, 0%, 70%, 1)` : `1px solid hsla(224, 6%, 69%, 1)`,
                            background: theme => theme.palette.mode === 'light' ? 'hsla(0, 0%, 94%, 1)' : 'hsla(224, 6%, 48%, 1)',
                            borderTopRightRadius: '8px',
                            borderTopLeftRadius: '8px',
                            '&:hover': {
                                cursor: 'pointer',
                                background: 'transparent',
                                border: theme => `1px solid ${theme.colors.main}`,
                            },
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Image
                                    loader={imageLoader}
                                    src={'/svg/breakfast.svg'}
                                    alt={'Success image'}
                                    width={128}
                                    height={128}
                                />
                            </Box>
                            <Typography variant="h5" textAlign={'center'} fontSize={'18px'}>
                                Plat/boisson/snack
                            </Typography>
                        </Box>
                        <Box onClick={ () => { setPendingIngredientDialogOpen(true); onClose(); }} sx={{
                            height: '192px',
                            border: theme => theme.palette.mode === 'light' ? `1px solid hsla(0, 0%, 70%, 1)` : `1px solid hsla(224, 6%, 69%, 1)`,
                            background: theme => theme.palette.mode === 'light' ? 'hsla(0, 0%, 94%, 1)' : 'hsla(224, 6%, 48%, 1)',
                            borderBottomRightRadius: '8px',
                            borderBottomLeftRadius: '8px',
                            '&:hover': {
                                cursor: 'pointer',
                                background: 'transparent',
                                border: theme => `1px solid ${theme.colors.main}`,
                            },
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Image
                                    loader={imageLoader}
                                    src={'/svg/ingredients.svg'}
                                    alt={'Success image'}
                                    width={128}
                                    height={128}
                                />
                            </Box>
                            <Typography variant="h5" textAlign={'center'} fontSize={'18px'}>
                                Ingrédient
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PendingDialog;
