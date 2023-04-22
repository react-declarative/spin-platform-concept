import { useState, useEffect, useRef } from "react";
import {
  One,
  FieldType,
  IField,
  useSubject,
  useStaticHandler,
  useReloadTrigger,
  useAudioPlayer,
  debounce,
  useActualValue,
  Subject,
} from "react-declarative";

import { makeStyles } from "../../styles";
import { alpha } from "@mui/material";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Paper, { PaperProps } from "@mui/material/Paper";
import Box from "@mui/material/Box";

import PlusIcon from "@mui/icons-material/Add";
import MinusIcon from "@mui/icons-material/Remove";

import weiToEth from "../../utils/weiToEth";

import { observer } from "mobx-react";

import WheelSpinner from "./components/WheelSpinner";

import ioc from "../../lib/ioc";

import { useSnackbar } from "notistack";

const useStyles = makeStyles()({
  root: {
    overflow: "hidden",
    minHeight: "600px",
    minWidth: "500px",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
    flexDirection: "column",
  },
  wheel: {
    background: alpha("#000", 0.3),
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  disabled: {
    pointerEvents: "none",
    opacity: 0.5,
  },
});

const fields: IField[] = [
  {
    type: FieldType.Div,
    style: {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      marginBottom: 7,
    },
    fields: [
      {
        type: FieldType.Component,
        element: ({ quantity, onChange }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pr: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() =>
                onChange({
                  quantity: Math.max(parseInt(quantity || 0) - 1, 1).toString(),
                })
              }
            >
              <MinusIcon />
            </IconButton>
          </Box>
        ),
      },
      {
        type: FieldType.Text,
        outlined: false,
        title: "Your bet",
        name: "quantity",
        defaultValue: "1",
        fieldRightMargin: "0",
        fieldBottomMargin: "0",
        compute: ({ quantity }) => `${quantity} CHIPS`,
      },
      {
        type: FieldType.Component,
        element: ({ quantity, maxAmount, onChange }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pl: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() =>
                onChange({
                  quantity: Math.min(
                    parseInt(quantity || 0) + 1,
                    maxAmount
                  ).toString(),
                })
              }
            >
              <PlusIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
  },
  {
    type: FieldType.Combo,
    itemList: ["even-key", "odd-key"],
    tr: (value) => {
      if (value === "even-key") {
        return "Even (x2)";
      }
      if (value === "odd-key") {
        return "Odd (x2)";
      }
      return "unknown";
    },
    name: "betType",
    title: "Bet on",
    outlined: false,
    defaultValue: "even-key",
  },
  {
    type: FieldType.Component,
    element: ({
      quantity: Q,
      cost: C,
      betType,
      _payload: { spinning, handleSpin },
    }) => {
      const quantity = parseInt(Q || 0);
      const cost = parseInt(C || 0);
      const value = quantity * cost;
      const eths = weiToEth(value);
      const win = weiToEth(value * 2);
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              flexWrap: "wrap",
              marginBottom: "-2.5px",
              gap: "5px",
            }}
          >
            <Box
              sx={{
                flex: 1,
                minWidth: "100%",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Typography>
                <strong>Bet price:</strong>
              </Typography>
              <Typography variant="body2">{`${eths} ETH`}</Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: "100%",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Typography>
                <strong>Win amount:</strong>
              </Typography>
              <Typography variant="body2">{`${win} ETH`}</Typography>
            </Box>
          </Box>
          <Button
            disabled={spinning || !betType}
            variant="contained"
            onClick={() => handleSpin(value, betType === "even-key")}
          >
            Spin the wheel
          </Button>
        </Box>
      );
    },
  },
];

interface IWheelWidgetProps extends PaperProps {}

const resultSubject = new Subject<{
  address: string;
  isWin: boolean;
}>();

export const WheelWidget = observer(
  ({ className, sx, ...otherProps }: IWheelWidgetProps) => {
    const { doReload, reloadTrigger } = useReloadTrigger();
    const [spinning, setSpinning] = useState(false);
    const isEvenRef = useRef(false);
    const isMounted = useRef(true);

    const spinning$ = useActualValue(spinning);

    const { render: renderSpin, play: playSpin } = useAudioPlayer({
      src: "/spin.mp3",
    });
    const { render: renderWin, play: playWin } = useAudioPlayer({
      src: "/win.mp3",
    });
    const { render: renderLose, play: playLose } = useAudioPlayer({
      src: "/lose.mp3",
    });

    const handler = useStaticHandler(
      async () => {
        const minimalBet = 1;
        const maximalBet = 10;
        return {
          cost: minimalBet,
          quantity: 3,
          maxAmount: Math.floor(maximalBet / minimalBet),
        };
      },
      {
        onLoadBegin: async () => await ioc.layoutService.setModalLoader(true),
        onLoadEnd: async () => await ioc.layoutService.setModalLoader(false),
      }
    );

    useEffect(
      () => () => {
        if (ioc.layoutService.hasAppbarLoader) {
          ioc.layoutService.setAppbarLoader(false);
        }
        isMounted.current = false;
      },
      []
    );

    const { classes, cx } = useStyles();

    const { enqueueSnackbar } = useSnackbar();

    const beginAnimate = useSubject<void>();
    const beginStop = useSubject<boolean>();

    useEffect(() => {
      return resultSubject.subscribe(
        async ({ address, isWin }) => {
          if (spinning$.current) {
            const currentAddress = await ioc.ethersService.getAccount();
            if (address === currentAddress) {
              handleStop(isWin);
            }
          }
        }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStop = debounce((isWin) => {
      if (!isMounted.current) {
        return;
      } else {
        if (isWin) {
          enqueueSnackbar("You won. Check your wallet for withdrawal", {
            variant: "success",
          });
          playWin();
        } else {
          enqueueSnackbar("You lose. We wish you better luck on a next spin", {
            variant: "error",
          });
          playLose();
        }
        beginStop.next(isWin ? isEvenRef.current : !isEvenRef.current);
        ioc.layoutService.setAppbarLoader(false);
      }
    }, 1_000);

    const handleSpin = debounce(async (value: number, isEven: boolean) => {
      ioc.layoutService.setAppbarLoader(true);
      setSpinning(true);
      try {
        beginAnimate.next();
        playSpin();
        setTimeout(async () => {
          const address = await ioc.ethersService.getAccount();
          address && resultSubject.next({
            address,
            isWin: Math.random() > 0.5,
          });
        }, 10_000);
        isEvenRef.current = isEven;
      } catch {
        doReload();
        enqueueSnackbar("It looks like you canceled the transaction", {
          variant: "warning",
        });
        ioc.layoutService.setAppbarLoader(false);
        setSpinning(false);
      }
    }, 1_000);

    return (
      <Paper className={cx(className, classes.root)} {...otherProps}>
        <Box className={classes.wheel}>
          <WheelSpinner
            key={reloadTrigger}
            beginAnimate={beginAnimate}
            beginStop={beginStop}
            onStop={() => setSpinning(false)}
          />
        </Box>
        <One
          className={cx({
            [classes.disabled]: spinning,
          })}
          handler={handler}
          sx={{
            p: 1,
            mb: 1,
          }}
          payload={{
            spinning,
            handleSpin,
          }}
          fields={fields}
        />
        {renderSpin()}
        {renderWin()}
        {renderLose()}
      </Paper>
    );
  }
);

export default WheelWidget;
